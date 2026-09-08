import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  userId: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  actif: boolean;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  apiKey: string;
  expiresAt: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api-keys`;

  getAll(): Observable<ApiKey[]> {
    return this.http.get<ApiKey[]>(this.base);
  }

  create(data: { name: string; expiresAt?: string }): Observable<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>(this.base, data);
  }

  revoke(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
