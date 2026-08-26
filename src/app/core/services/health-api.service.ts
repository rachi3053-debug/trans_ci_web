import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthStatus {
  status: string;
  service?: string;
}

@Injectable({ providedIn: 'root' })
export class HealthApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getStatus(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.base}/health`);
  }
}
