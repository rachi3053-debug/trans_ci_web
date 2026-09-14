import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';

// Modules metiers en attente de developpement : routes placeholder protegees
// par permission. Le ROOT (bypass isRoot) les voit toutes ; les autres
// utilisateurs uniquement s'ils détiennent le code de permission correspondant.
const MODULE_ROUTES: { path: string; permission: string; title: string }[] = [
  { path: 'tenants', permission: 'TENANT:READ', title: 'Tenants' },
  { path: 'chauffeurs', permission: 'CHAUFFEUR:READ', title: 'Chauffeurs' },
  { path: 'vehicules', permission: 'VEHICULE:READ', title: 'Véhicules' },
  { path: 'gares', permission: 'GARE:READ', title: 'Gares' },
  { path: 'trajets', permission: 'TRAJET:READ', title: 'Trajets' },
  { path: 'departs', permission: 'DEPART:READ', title: 'Départs' },
  { path: 'colis', permission: 'COLIS:READ', title: 'Colis' },
  { path: 'finance', permission: 'FINANCE:READ', title: 'Finance' },
  { path: 'parametres', permission: 'PARAMETRE:READ', title: 'Paramètres' },
];

function buildModuleRoutes(): Routes {
  return MODULE_ROUTES.map(({ path, permission, title }) => ({
    path,
    canActivate: [permissionGuard],
    data: { permissions: [permission], title },
    loadComponent: () =>
      import('./features/modules/module-placeholder.component').then((m) => m.ModulePlaceholderComponent),
  }));
}

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/activate',
    loadComponent: () =>
      import('./features/auth/activation/activation.component').then((m) => m.ActivationComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./features/auth/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'administration/utilisateurs',
        canActivate: [permissionGuard],
        data: { permissions: ['USER:READ'] },
        loadComponent: () =>
          import('./features/administration/utilisateurs/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'administration/utilisateurs/nouveau',
        canActivate: [permissionGuard],
        data: { permissions: ['USER:CREATE'] },
        loadComponent: () =>
          import('./features/administration/utilisateurs/user-create.component').then((m) => m.UserCreateComponent),
      },
      {
        path: 'administration/utilisateurs/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['USER:READ'] },
        loadComponent: () =>
          import('./features/administration/utilisateurs/user-detail.component').then((m) => m.UserDetailComponent),
      },
      {
        path: 'administration/roles',
        canActivate: [permissionGuard],
        data: { permissions: ['ROLE:READ'] },
        loadComponent: () =>
          import('./features/administration/roles/role-list.component').then((m) => m.RoleListComponent),
      },
      {
        path: 'administration/roles/nouveau',
        canActivate: [permissionGuard],
        data: { permissions: ['ROLE:CREATE'] },
        loadComponent: () =>
          import('./features/administration/roles/role-create.component').then((m) => m.RoleCreateComponent),
      },
      {
        path: 'administration/roles/:id',
        canActivate: [permissionGuard],
        data: { permissions: ['ROLE:READ'] },
        loadComponent: () =>
          import('./features/administration/roles/role-detail.component').then((m) => m.RoleDetailComponent),
      },
      {
        path: 'administration/permissions',
        canActivate: [permissionGuard],
        data: { permissions: ['PERMISSION:READ'] },
        loadComponent: () =>
          import('./features/administration/permissions/permission-list.component').then((m) => m.PermissionListComponent),
      },
      ...buildModuleRoutes(),
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];