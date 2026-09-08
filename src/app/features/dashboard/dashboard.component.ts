import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';
import { RoleService } from '../../core/services/role.service';
import { UserService } from '../../core/services/user.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { UiKpiCardComponent } from '../../shared/components/ui-kpi-card.component';
import { UiStatusBadgeComponent } from '../../shared/components/ui-status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiKpiCardComponent, UiStatusBadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);

  readonly user = this.auth.user;
  readonly roles = this.auth.roles;
  readonly userCount = signal(0);
  readonly roleCount = signal(0);
  readonly permissionCount = signal(0);
  readonly statsLoading = signal(true);

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.userCount.set(users.length);
        this.statsLoading.set(false);
      },
      error: () => this.statsLoading.set(false),
    });
    this.roleService.getAll().subscribe({
      next: (roles) => this.roleCount.set(roles.length),
      error: () => {},
    });
    this.permissionService.getAll().subscribe({
      next: (permissions) => this.permissionCount.set(permissions.length),
      error: () => {},
    });
  }

  hasPermission(permission: string): boolean {
    return this.auth.hasPermission(permission);
  }
}