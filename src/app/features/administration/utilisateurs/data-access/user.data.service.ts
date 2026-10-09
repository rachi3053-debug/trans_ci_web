import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/auth/models/user.model';
import { Role } from '../../../../core/auth/models/role.model';
import { fetchAllPages } from '../../../../core/models/paginated.model';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return fetchAllPages<User>(this.http, this.base);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(data: { nom: string; prenom: string; email: string; telephone?: string; roleCode?: string }): Observable<User> {
    return this.http.post<User>(this.base, data);
  }

  update(id: string, data: Partial<{ nom: string; prenom: string; email: string; telephone: string; password: string; actif: boolean }>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignRoles(id: string, roleCodes: string[]): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/roles`, { roleCodes });
  }

  /**
   * Rôles actuellement affectés à l'utilisateur.
   *
   * Le backend (`UsersService.getUserRoles`) renvoie des entités `Role`
   * complètes, `tenantId` compris : l'UI doit pouvoir distinguer un rôle global
   * (`tenantId === null`) d'un rôle de tenant, sinon elle proposerait comme
   * cochable un rôle que `POST /users/:id/roles` refuse (403).
   *
   * Type élargi depuis `{ id; code; libelle }[]` : retour compatible avec les
   * appelants existants (`Role` est un sur-ensemble de l'ancien type).
   */
  getRoles(id: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.base}/${id}/roles`);
  }

  setPassword(id: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/setup-password`, {
      password,
      passwordAction: 'set-password',
    });
  }

  resendInvitation(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/resend-invitation`, {});
  }

  uploadAvatar(id: string, file: File): Observable<{ path: string; signedUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<{ path: string; signedUrl: string }>(
      `${this.base}/${id}/avatar`,
      formData,
    );
  }

  getAvatarUrl(id: string): Observable<{ path: string; signedUrl: string }> {
    return this.http.get<{ path: string; signedUrl: string }>(
      `${this.base}/${id}/avatar`,
    );
  }
}
