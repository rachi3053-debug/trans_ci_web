import { Injectable, inject } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from '@/app/core/auth/services/auth.service';

/**
 * Charge les permissions de l'utilisateur connecte dans ngx-permissions.
 * La source de verite reste le token (AuthService), injecte par le backend.
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionLoaderService {
  private readonly permissionsService = inject(NgxPermissionsService);
  private readonly authService = inject(AuthService);

  private loadPromise: Promise<void> | null = null;

  constructor() {
    // loadPermissions() est appele par la coquille (main-layout)
  }

  loadPermissions(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = Promise.resolve().then(() => {
      const permissions = this.authService.permissions();
      this.permissionsService.flushPermissions();
      if (permissions.length > 0) {
        this.permissionsService.loadPermissions(permissions);
      }
    });

    return this.loadPromise;
  }

  arePermissionsLoaded(): boolean {
    return this.loadPromise !== null;
  }
}