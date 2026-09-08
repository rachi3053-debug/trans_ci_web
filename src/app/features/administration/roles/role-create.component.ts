import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/auth/models/permission.model';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    PageHeaderComponent,
  ],
  templateUrl: './role-create.component.html',
  styleUrl: './role-create.component.scss',
})
export class RoleCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);
  private readonly toastr = inject(ToastrCustomService);

  readonly allPermissions = signal<Permission[]>([]);
  readonly selectedIds = signal(new Set<string>());
  readonly modules = signal<string[]>([]);
  readonly expandedModules = signal(new Set<string>());
  readonly submitting = signal(false);

  readonly selectedCount = computed(() => this.selectedIds().size);

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    libelle: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.permissionService.getAll().subscribe({
      next: (perms) => {
        this.allPermissions.set(perms);
        const mods = [...new Set(perms.map(p => p.module))].sort();
        this.modules.set(mods);
        this.expandedModules.set(new Set(mods));
      },
    });
  }

  getModulePermissions(module: string): Permission[] {
    return this.allPermissions().filter(p => p.module === module);
  }

  getModuleSelectedCount(module: string): number {
    const perms = this.getModulePermissions(module);
    const sel = this.selectedIds();
    return perms.filter(p => sel.has(p.id)).length;
  }

  isModuleExpanded(module: string): boolean {
    return this.expandedModules().has(module);
  }

  toggleModule(module: string): void {
    const next = new Set(this.expandedModules());
    if (next.has(module)) next.delete(module); else next.add(module);
    this.expandedModules.set(next);
  }

  togglePermission(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id); else next.add(id);
    this.selectedIds.set(next);
  }

  selectAll(): void { this.selectedIds.set(new Set(this.allPermissions().map(p => p.id))); }
  deselectAll(): void { this.selectedIds.set(new Set()); }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const codes = this.allPermissions().filter(p => this.selectedIds().has(p.id)).map(p => p.code);
    const data = { ...this.form.getRawValue() };
    this.roleService.create(data).subscribe({
      next: (role) => {
        if (codes.length > 0) {
          this.roleService.assignPermissions(role.id, codes).subscribe({
            complete: () => { this.toastr.showSuccessToastr('Rôle créé avec succès'); this.router.navigate(['/administration/roles']); },
          });
        } else {
          this.toastr.showSuccessToastr('Rôle créé avec succès');
          this.router.navigate(['/administration/roles']);
        }
      },
      error: (err) => { this.submitting.set(false); this.toastr.showErrorToastr(err.error?.message || 'Erreur lors de la création du rôle'); },
    });
  }
}