import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ROOT : accès global, toutes permissions.
  if (auth.isRoot()) {
    return true;
  }

  const requiredPermissions = (route.data['permissions'] as string[]) ?? [];
  const requireAll = (route.data['requireAll'] as boolean) ?? false;

  if (requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requireAll
    ? auth.hasAllPermissions(requiredPermissions)
    : auth.hasAnyPermission(requiredPermissions);

  if (hasAccess) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
