import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../auth/models/role.model';
import { Permission } from '../auth/models/permission.model';
import { fetchAllPages } from '../models/paginated.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/roles`;

  getAll(): Observable<Role[]> {
    return fetchAllPages<Role>(this.http, this.base);
  }

  getById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.base}/${id}`);
  }

  create(data: { code: string; libelle: string; description?: string }): Observable<Role> {
    return this.http.post<Role>(this.base, data);
  }

  update(id: string, data: Partial<{ code: string; libelle: string; description: string }>): Observable<Role> {
    return this.http.put<Role>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignPermissions(id: string, permissionCodes: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.base}/${id}/permissions`, { permissionCodes });
  }

  getPermissions(id: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.base}/${id}/permissions`);
  }
}
