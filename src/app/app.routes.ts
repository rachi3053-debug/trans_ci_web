import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { guestGuard } from './core/auth/guards/guest.guard';
import { permissionGuard } from './core/auth/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
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
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];