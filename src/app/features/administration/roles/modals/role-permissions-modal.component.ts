import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleMetier } from '../data-access/role.metier';

import { Permission } from '../../../../core/auth/models/permission.model';
import { PermissionDataService } from '../../permissions/data-access/permission.data.service';

export interface RolePermissionsModalData {
  roleId: string;
  roleLabel: string;
}

@Component({
  selector: 'app-role-permissions-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
  ],
  templateUrl: './role-permissions-modal.component.html',
  styleUrl: './role-permissions-modal.component.scss',
})
export class RolePermissionsModalComponent implements OnInit {
  readonly activeModal = inject(NgbActiveModal);
  private readonly metier = inject(RoleMetier);
  private readonly permissionData = inject(PermissionDataService);

  data: RolePermissionsModalData = { roleId: '', roleLabel: '' };

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly allPermissions = signal<Permission[]>([]);
  readonly modules = signal<string[]>([]);
  readonly selectedCodes = signal(new Set<string>());

  ngOnInit(): void {
    this.permissionData.getAll().subscribe({
      next: (perms) => {
        this.allPermissions.set(perms);
        this.modules.set([...new Set(perms.map((p) => p.module))].sort());
        this.metier.getRolePermissions(this.data.roleId).subscribe({
          next: (assigned) => this.selectedCodes.set(new Set(assigned.map((p) => p.code))),
          complete: () => this.loading.set(false),
        });
      },
    });
  }

  permsByModule(mod: string): Permission[] {
    return this.allPermissions().filter((p) => p.module === mod);
  }

  isModuleAllSelected(mod: string): boolean {
    const perms = this.permsByModule(mod);
    return perms.length > 0 && perms.every((p) => this.selectedCodes().has(p.code));
  }

  isModuleIndeterminate(mod: string): boolean {
    const perms = this.permsByModule(mod);
    const selected = perms.filter((p) => this.selectedCodes().has(p.code)).length;
    return selected > 0 && selected < perms.length;
  }

  toggleModule(mod: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedCodes());
    for (const p of this.permsByModule(mod)) {
      if (checked) next.add(p.code); else next.delete(p.code);
    }
    this.selectedCodes.set(next);
  }

  togglePermission(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedCodes());
    if (checked) next.add(code); else next.delete(code);
    this.selectedCodes.set(next);
  }

  onSave(): void {
    this.submitting.set(true);
    this.metier.assignPermissions(this.data.roleId, [...this.selectedCodes()]).subscribe({
      next: () => this.activeModal.close(true),
      error: () => this.submitting.set(false),
    });
  }
}