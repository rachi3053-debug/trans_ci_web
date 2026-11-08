import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../token.service';
import { User, LoginResponse, RefreshResponse, JwtPayload } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);

  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal(false);
  private readonly _initialized = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly initialized = this._initialized.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user());
  readonly roles = computed(() => this.extractFromToken<string[]>('roles') ?? []);
  readonly permissions = computed(() => this.extractFromToken<string[]>('permissions') ?? []);
  readonly isRootUser = computed(() => this.isRoot());
  readonly tenantId = computed(() => this.extractFromToken<string | null>('tenantId') ?? null);

  constructor() {
    this.loadUserFromStorage();
  }

  login(email: string, password: string, remember = true): Observable<LoginResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.tokenService.setRemember(remember);
          this.tokenService.setTokens(res.accessToken, res.refreshToken);
          this.tokenService.setTenantId(
            res.user?.tenantId ?? this.extractFromToken<string>('tenantId') ?? null,
          );
          this._user.set(res.user);
          this._loading.set(false);
        }),
        catchError((err) => {
          this._loading.set(false);
          const message =
            err.error?.message || err.message || 'Identifiants invalides';
          this._error.set(message);
          throw err;
        }),
      );
  }

  logout(): void {
    // Le backend doit blacklister le token, on le prévenons avant de purger.
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken) {
      this.notifyBackendLogout(accessToken, this.tokenService.getTenantId());
    }

    this.tokenService.clearTokens();
    this._user.set(null);
    this._error.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Prévient le backend de la déconnexion via `POST /auth/logout`
   * (cf. `auth.controller.ts` côté API : `logout(@CurrentUser(), @Body('token'))`),
   * afin que le token soit ajouté à la blacklist serveur.
   *
   * Choix technique : cette route est protégée par le `JwtAuthGuard` global,
   * elle exige donc l'en-tête `Authorization`. `navigator.sendBeacon` ne permet
   * pas d'ajouter des en-têtes (il renverrait un 401 systématique), on utilise
   * donc `fetch` avec `keepalive: true`, qui survit à la navigation vers
   * `/login`. On n'utilise volontairement pas `HttpClient` : l'intercepteur
   * d'auth réagit à un 401 en tentant un refresh puis un logout, ce qui
   * boucle.
   *
   * Best-effort : la purge locale est effectuée par `logout()` quoi qu'il
   * arrive (succès, erreur réseau ou exception), donc le comportement
   * historique de déconnexion est préservé.
   */
  private notifyBackendLogout(token: string, tenantId: string | null): void {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    try {
      void fetch(`${environment.apiUrl}/auth/logout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
        keepalive: true,
      }).catch(() => {
        // Réseau indisponible : le token restera valide jusqu'à son expiration,
        // la purge locale a déjà eu lieu.
      });
    } catch {
      // `fetch` indisponible ou URL invalide : idem, purge locale garantie.
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.tokenService.setTenantId(
          user?.tenantId ?? this.extractFromToken<string>('tenantId') ?? null,
        );
        this._user.set(user);
        this._initialized.set(true);
      }),
      catchError(() => {
        this._initialized.set(true);
        throw new Error('Session invalide');
      }),
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return of({ accessToken: '' });
    }

    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          this.tokenService.setAccessToken(res.accessToken);
        }),
        catchError(() => {
          this.tokenService.clearTokens();
          this._user.set(null);
          this.router.navigate(['/login']);
          return of({ accessToken: '' });
        }),
      );
  }

  /**
   * Valide un jeton d'invitation (page d'activation publique).
   */
  validateActivationToken(token: string): Observable<{ valid: boolean; email?: string; expiresAt?: string }> {
    return this.http.get<{ valid: boolean; email?: string; expiresAt?: string }>(
      `${environment.apiUrl}/auth/activation/validate`,
      { params: { token } },
    );
  }

  /**
   * Active un compte invité : définit le mot de passe fourni par l'utilisateur.
   */
  activateAccount(token: string, password: string, confirmPassword: string): Observable<{ id: string; email: string }> {
    return this.http.post<{ id: string; email: string }>(
      `${environment.apiUrl}/auth/activation/activate`,
      { token, password, confirmPassword },
    );
  }

  /**
   * Mot de passe oublié : demande l'envoi d'un lien de réinitialisation.
   */
  forgotPassword(email: string): Observable<null> {
    return this.http.post<null>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Réinitialise le mot de passe avec le jeton reçu par email.
   */
  resetPassword(token: string, password: string, confirmPassword: string): Observable<{ id: string; email: string }> {
    return this.http.post<{ id: string; email: string }>(
      `${environment.apiUrl}/auth/reset-password`,
      { token, password, confirmPassword },
    );
  }

  initialize(): Observable<User | null> {
    if (!this.tokenService.hasTokens()) {
      this._initialized.set(true);
      return of(null);
    }

    return this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  /**
   * Indique si l'utilisateur connecte est ROOT (super-administrateur systeme).
   * Source de verite : le payload JWT (`isRoot` === true OU role 'ROOT'),
   * jamais une deduction a partir de l'absence de tenant.
   */
  isRoot(): boolean {
    return (
      this.extractFromToken<boolean>('isRoot') === true ||
      this.roles().includes('ROOT')
    );
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.roles().includes(role));
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((perm) => this.permissions().includes(perm));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((perm) => this.permissions().includes(perm));
  }

  getAccessToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  private loadUserFromStorage(): void {
    const token = this.tokenService.getAccessToken();
    if (!token) return;

    try {
      const payload = this.decodeToken(token);
      if (payload && !this.isTokenExpired(payload)) {
        this._user.set({
          id: payload.sub,
          email: payload.email,
          nom: '',
          prenom: '',
          telephone: null,
          actif: true,
          emailVerified: true,
          lastLoginAt: null,
          createdAt: '',
          updatedAt: '',
          tenantId: (payload['tenantId'] as string | undefined) ?? null,
        });
      } else {
        this.tokenService.clearTokens();
      }
    } catch {
      this.tokenService.clearTokens();
    }
  }

  private extractFromToken<T>(key: string): T | null {
    const token = this.tokenService.getAccessToken();
    if (!token) return null;

    try {
      const payload = this.decodeToken(token);
      return payload?.[key] as T ?? null;
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenExpired(payload: JwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }
}
