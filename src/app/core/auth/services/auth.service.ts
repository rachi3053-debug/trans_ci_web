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
    this.tokenService.clearTokens();
    this._user.set(null);
    this._error.set(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
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
