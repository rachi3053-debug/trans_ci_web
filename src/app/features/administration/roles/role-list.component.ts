import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { UiEmptyStateComponent } from '../../../shared/components/ui-empty-state.component';
import { RoleMetier } from './data-access/role.metier';
import { AuthService } from '../../../core/auth/services/auth.service';
import { Role } from '../../../core/auth/models/role.model';
import { AddEditRoleModalComponent, AddEditRoleModalData } from './modals/add-edit-role-modal.component';
import { RolePermissionsModalComponent, RolePermissionsModalData } from './modals/role-permissions-modal.component';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';
import { ConfirmService } from '../../../core/helper/confirm.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule, NgbDropdownModule,
    PageHeaderComponent, UiEmptyStateComponent,
  ],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  private readonly metier = inject(RoleMetier);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrCustomService);
  private readonly confirmService = inject(ConfirmService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly roles = signal<Role[]>([]);
  readonly filteredRoles = signal<Role[]>([]);
  searchTerm = '';

  ngOnInit(): void { this.loadRoles(); }

  loadRoles(): void {
    this.loading.set(true);
    this.metier.getAllRoles().subscribe({
      next: (r) => { this.roles.set(r); this.filteredRoles.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.showErrorToastr('Erreur de chargement des rôles'); },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredRoles.set(term ? this.roles().filter(r => r.code.toLowerCase().includes(term) || r.libelle.toLowerCase().includes(term)) : this.roles());
  }

  openCreateRole(): void {
    const ref = this.modalService.open(AddEditRoleModalComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.data = { mode: 'create' } as AddEditRoleModalData;
    ref.result.then((created) => {
      if (created) { this.loadRoles(); this.toastr.showSuccessToastr('Rôle créé avec succès'); }
    }).catch(() => undefined);
  }

  openEditRole(role: Role): void {
    const ref = this.modalService.open(AddEditRoleModalComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.data = {
      mode: 'edit',
      role: { id: role.id, code: role.code, libelle: role.libelle, description: role.description },
    } as AddEditRoleModalData;
    ref.result.then((updated) => {
      if (updated) { this.loadRoles(); this.toastr.showSuccessToastr('Rôle mis à jour avec succès'); }
    }).catch(() => undefined);
  }

  openPermissions(role: Role): void {
    const ref = this.modalService.open(RolePermissionsModalComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.data = { roleId: role.id, roleLabel: role.libelle } as RolePermissionsModalData;
    ref.result.then((done) => {
      if (done) { this.toastr.showSuccessToastr('Permissions mises à jour avec succès'); }
    }).catch(() => undefined);
  }

  confirmDelete(role: Role): void {
    this.confirmService.confirmDelete(`le rôle "${role.libelle}"`).then((ok) => {
      if (ok) this.metier.deleteRole(role.id).subscribe({
        next: () => { this.loadRoles(); this.toastr.showSuccessToastr('Rôle supprimé avec succès'); },
        error: () => this.toastr.showErrorToastr('Erreur lors de la suppression du rôle'),
      });
    });
  }
}