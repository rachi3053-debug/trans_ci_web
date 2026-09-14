import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // ROOT : accès global, aucun rôle requis.
  if (auth.isRoot()) {
    return true;
  }

  const requiredRoles = (route.data['roles'] as string[]) ?? [];

  if (requiredRoles.length === 0) {
    return true;
  }

  if (auth.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
