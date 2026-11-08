import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { UiEmptyStateComponent } from '../../../shared/components/ui-empty-state.component';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/auth/models/permission.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';
import { ConfirmService } from '../../../core/helper/confirm.service';
import {PermissionMetier} from '@views/administration/permissions/data-access/permission.metier';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, NgbPaginationModule, UiEmptyStateComponent],
  templateUrl: './permission-list.component.html',
  styleUrl: './permission-list.component.scss',
})
export class PermissionListComponent implements OnInit {
  private readonly permissionMetier = inject(PermissionMetier);
  private readonly toastr = inject(ToastrCustomService);
  private readonly confirmService = inject(ConfirmService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly permissions = signal<Permission[]>([]);
  readonly allModules = signal<string[]>([]);
  readonly filteredPermissions = signal<Permission[]>([]);
  readonly paginatedPermissions = signal<Permission[]>([]);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  searchTerm = '';
  filterModule = '';
  filterAction = '';

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading.set(true);
    this.permissionMetier.getAllPermissions().subscribe({
      next: (perms) => {
        this.permissions.set(perms);
        this.allModules.set([...new Set(perms.map((p) => p.module))].sort());
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastr.showErrorToastr('Erreur de chargement des permissions');
      },
    });
  }

  applyFilter(): void {

    let perms = this.permissions();
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      perms = perms.filter((p) => p.code.toLowerCase().includes(term) || p.libelle.toLowerCase().includes(term));
    }
    if (this.filterModule) perms = perms.filter((p) => p.module === this.filterModule);
    if (this.filterAction) perms = perms.filter((p) => p.action === this.filterAction);
    this.filteredPermissions.set(perms);
    this.pageIndex.set(0);
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page - 1);
    this.updatePagination();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0);
    this.updatePagination();
  }

  paginationInfo(): string {
    const total = this.filteredPermissions().length;
    if (total === 0) return '0 permission';
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return `${start}–${end} sur ${total}`;
  }

  updatePagination(): void {
    const start = this.pageIndex() * this.pageSize();
    this.paginatedPermissions.set(this.filteredPermissions().slice(start, start + this.pageSize()));
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      READ: 'Lecture',
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      VALIDATE: 'Validation',
      EXPORT: 'Export',
    };
    return map[action] || action;
  }

  openEdit(perm: Permission): void {
    this.toastr.showInfoToastr(`L'édition de la permission "${perm.code}" n'est pas encore disponible.`);
  }

  confirmDelete(perm: Permission): void {
    this.confirmService.confirmDelete(`la permission "${perm.code}"`).then((ok) => {
      if (ok) {
        this.permissionMetier.deletePermission(perm.id).subscribe({
          next: () => {
            this.loadPermissions();
            this.toastr.showSuccessToastr('Permission supprimée avec succès');
          },
          error: () => this.toastr.showErrorToastr('Erreur lors de la suppression de la permission'),
        });
      }
    });
  }
}
