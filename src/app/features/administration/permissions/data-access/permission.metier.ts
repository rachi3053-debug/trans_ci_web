import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission } from '../../../../core/auth/models/permission.model';
import { PermissionDataService } from './permission.data.service';

export interface CreatePermissionPayload {
  code: string;
  libelle: string;
  description?: string;
  module: string;
  action: string;
}

export interface UpdatePermissionPayload {
  code?: string;
  libelle?: string;
  description?: string;
  module?: string;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionMetier {
  private readonly data = inject(PermissionDataService);

  getAllPermissions(): Observable<Permission[]> {
    return this.data.getAll();
  }

  getPermission(id: string): Observable<Permission> {
    return this.data.getById(id);
  }

  createPermission(payload: CreatePermissionPayload): Observable<Permission> {
    return this.data.create(payload);
  }

  updatePermission(id: string, payload: UpdatePermissionPayload): Observable<Permission> {
    return this.data.update(id, payload);
  }

  deletePermission(id: string): Observable<void> {
    return this.data.delete(id);
  }
}
