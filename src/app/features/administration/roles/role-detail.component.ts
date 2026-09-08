import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Role } from '../../../core/auth/models/role.model';
import { Permission } from '../../../core/auth/models/permission.model';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    PageHeaderComponent,
  ],
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.scss',
})
export class RoleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleService);
  readonly auth = inject(AuthService);

  readonly role = signal<Role | null>(null);
  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(true);
  readonly moduleNames = computed(() => [...new Set(this.permissions().map(p => p.module))].sort());
  readonly expandedModules = signal(new Set<string>());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadRole(id);
  }

  loadRole(id: string): void {
    this.roleService.getById(id).subscribe({
      next: (role) => {
        this.role.set(role);
        this.roleService.getPermissions(id).subscribe({
          next: (p) => {
            this.permissions.set(p);
            this.expandedModules.set(new Set(this.moduleNames()));
            this.loading.set(false);
          },
        });
      },
      error: () => this.loading.set(false),
    });
  }

  getModulePerms(module: string): Permission[] {
    return this.permissions().filter(p => p.module === module);
  }

  isModuleExpanded(module: string): boolean {
    return this.expandedModules().has(module);
  }

  toggleModule(module: string): void {
    const next = new Set(this.expandedModules());
    if (next.has(module)) next.delete(module); else next.add(module);
    this.expandedModules.set(next);
  }
}