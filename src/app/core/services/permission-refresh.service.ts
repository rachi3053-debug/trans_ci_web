import { Injectable, inject } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { AuthService } from '@/app/core/auth/services/auth.service';

/**
 * Rafraichit les permissions dans ngx-permissions a partir de la session
 * de l'utilisateur connecte (AuthService / token).
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionRefreshService {
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly authService = inject(AuthService);
  private readonly permissionUpdateSubject = new Subject<void>();
  readonly permissionUpdates$ = this.permissionUpdateSubject.asObservable();

  refreshPermissions(): string[] {
    const permissions = this.authService.permissions();
    this.permissionsService.flushPermissions();
    if (permissions.length > 0) {
      this.permissionsService.loadPermissions(permissions);
    }
    this.permissionUpdateSubject.next();
    return permissions;
  }

  refreshCurrentUserPermissions(): void {
    this.refreshPermissions();
  }
}