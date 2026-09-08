import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permission } from '../auth/models/permission.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/permissions`;

  getAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.base);
  }

  getById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.base}/${id}`);
  }

  create(data: { code: string; libelle: string; description?: string; module: string; action: string }): Observable<Permission> {
    return this.http.post<Permission>(this.base, data);
  }

  update(id: string, data: Partial<{ code: string; libelle: string; description: string; module: string; action: string }>): Observable<Permission> {
    return this.http.put<Permission>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
