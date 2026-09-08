import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../../../../core/auth/models/role.model';
import { Permission } from '../../../../core/auth/models/permission.model';
import { RoleDataService } from './role.data.service';

export interface CreateRolePayload {
  code: string;
  libelle: string;
  description?: string;
}

export interface UpdateRolePayload {
  code?: string;
  libelle?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleMetier {
  private readonly data = inject(RoleDataService);

  getAllRoles(): Observable<Role[]> {
    return this.data.getAll();
  }

  getRole(id: string): Observable<Role> {
    return this.data.getById(id);
  }

  createRole(payload: CreateRolePayload): Observable<Role> {
    return this.data.create(payload);
  }

  updateRole(id: string, payload: UpdateRolePayload): Observable<Role> {
    return this.data.update(id, payload);
  }

  deleteRole(id: string): Observable<void> {
    return this.data.delete(id);
  }

  assignPermissions(id: string, permissionCodes: string[]): Observable<Role> {
    return this.data.assignPermissions(id, permissionCodes);
  }

  getRolePermissions(id: string): Observable<Permission[]> {
    return this.data.getPermissions(id);
  }
}
