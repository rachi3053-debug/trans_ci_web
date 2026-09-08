import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../auth/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  create(data: { nom: string; prenom: string; email: string; telephone?: string; password: string }): Observable<User> {
    return this.http.post<User>(this.base, data);
  }

  update(id: string, data: Partial<{ nom: string; prenom: string; email: string; telephone: string; password: string; actif: boolean }>): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignRoles(id: string, roleCodes: string[]): Observable<User> {
    return this.http.post<User>(`${this.base}/${id}/roles`, { roleCodes });
  }

  getRoles(id: string): Observable<{ id: string; code: string; libelle: string }[]> {
    return this.http.get<{ id: string; code: string; libelle: string }[]>(`${this.base}/${id}/roles`);
  }
}
