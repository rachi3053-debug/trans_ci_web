import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { NgbDropdownModule, NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { UiEmptyStateComponent } from '../../../shared/components/ui-empty-state.component';
import { UserMetier } from './data-access/user.metier';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { User } from '../../../core/auth/models/user.model';
import { Role } from '../../../core/auth/models/role.model';
import { AddEditUserModalComponent, AddEditUserModalData } from './modals/add-edit-user-modal.component';
import { UserPasswordModalComponent, UserPasswordModalData } from './modals/user-password-modal.component';
import { UserRolesModalComponent, UserRolesModalData } from './modals/user-roles-modal.component';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';
import { ConfirmService } from '../../../core/helper/confirm.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    NgbDropdownModule, NgbPaginationModule,
    PageHeaderComponent, UiEmptyStateComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  private readonly metier = inject(UserMetier);
  private readonly roleService = inject(RoleService);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrCustomService);
  private readonly confirmService = inject(ConfirmService);
  readonly auth = inject(AuthService);

  readonly loading = signal(true);
  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly paginatedUsers = signal<User[]>([]);
  readonly avatarUrls = signal<Record<string, string>>({});
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly sortField = signal('');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  ngOnInit(): void {
    this.loadUsers();
    this.roleService.getAll().subscribe({ next: (r) => this.roles.set(r) });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.metier.getAllUsers().subscribe({
      next: (users) => { this.users.set(users); this.applyFilter(); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toastr.showErrorToastr('Erreur de chargement'); },
    });
  }

  applyFilter(): void {
    let result = this.users();
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => u.nom.toLowerCase().includes(term) || u.prenom.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }
    if (this.filterStatus) {
      result = result.filter(u => {
        if (this.filterStatus === 'invited') return u.status === 'INVITED';
        return this.filterStatus === 'active' ? u.actif : !u.actif;
      });
    }
    this.filteredUsers.set(result);
    this.pageIndex.set(0);
    this.updatePagination();
  }

  onSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    const data = [...this.filteredUsers()];
    const factor = this.sortDir() === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[field] ?? '';
      const vb = (b as unknown as Record<string, unknown>)[field] ?? '';
      return String(va).localeCompare(String(vb)) * factor;
    });
    this.filteredUsers.set(data);
    this.updatePagination();
  }

  sortIcon(field: string): string {
    if (this.sortField() !== field) return 'bi bi-chevron-expand';
    return this.sortDir() === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill';
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
    const total = this.filteredUsers().length;
    if (total === 0) return '0 utilisateur';
    const start = this.pageIndex() * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return `${start}–${end} sur ${total}`;
  }

  updatePagination(): void {
    const start = this.pageIndex() * this.pageSize();
    this.paginatedUsers.set(this.filteredUsers().slice(start, start + this.pageSize()));
    this.loadAvatars();
  }

  /**
   * Charge l'URL signée de chaque avatar présent sur la page courante.
   * L'URL est générée côté API (bucket privé : le front n'a pas la clé Supabase).
   */
  private loadAvatars(): void {
    const current = this.pageIndex() * this.pageSize();
    const page = this.filteredUsers().slice(current, current + this.pageSize());
    const urls: Record<string, string> = {};
    const pending: Promise<void>[] = page
      .filter((u) => u.avatarPath && !this.avatarUrls()[u.id])
      .map((u) =>
        lastValueFrom(this.metier.getAvatarUrl(u.id))
          .then(({ signedUrl }) => {
            urls[u.id] = signedUrl;
          })
          .catch(() => undefined),
      );
    Promise.all(pending).then(() => {
      if (Object.keys(urls).length > 0) {
        this.avatarUrls.update((map) => ({ ...map, ...urls }));
      }
    });
  }

  openCreateUser(): void {
    const ref = this.modalService.open(AddEditUserModalComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.data = {
      mode: 'create',
    } as AddEditUserModalData;
    ref.closed.subscribe((created: boolean) => {
      if (created) { this.loadUsers(); this.toastr.showSuccessToastr('Utilisateur créé avec succès'); }
    });
  }

  openEditUser(user: User): void {
    const ref = this.modalService.open(AddEditUserModalComponent, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.data = {
      mode: 'edit',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        avatarPath: user.avatarPath ?? null,
      },
    } as AddEditUserModalData;
    ref.closed.subscribe((updated: boolean) => {
      if (updated) { this.loadUsers(); this.toastr.showSuccessToastr('Utilisateur mis à jour'); }
    });
  }

/*  openPassword(user: User): void {
    const ref = this.modalService.open(UserPasswordModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.data = { userId: user.id, email: user.email } as UserPasswordModalData;
    ref.closed.subscribe((done: boolean) => {
      if (done) { this.toastr.showSuccessToastr('Mot de passe mis à jour'); }
    });
  }*/

  openRoles(user: User): void {
    const ref = this.modalService.open(UserRolesModalComponent, { size: 'md', backdrop: 'static' });
    ref.componentInstance.data = { userId: user.id, userName: `${user.prenom} ${user.nom}` } as UserRolesModalData;
    ref.closed.subscribe((done: boolean) => {
      if (done) { this.toastr.showSuccessToastr('Rôles mis à jour'); }
    });
  }

  toggleActive(user: User): void {
    this.metier.toggleActive(user).subscribe({
      next: () => { this.loadUsers(); this.toastr.showSuccessToastr('Statut mis à jour'); },
      error: () => this.toastr.showErrorToastr('Erreur lors de la mise à jour'),
    });
  }

  resendInvitation(user: User): void {
    this.metier.resendInvitation(user.id).subscribe({
      next: () => {
        this.loadUsers();
        this.toastr.showSuccessToastr('Invitation renvoyée par email');
      },
      error: (err) => this.toastr.showErrorToastr(err.error?.message || 'Erreur lors de l\'envoi'),
    });
  }

  statusBadgeClass(user: User): string {
    if (user.status === 'INVITED') return 'text-bg-warning';
    return user.actif ? 'text-bg-success' : 'text-bg-danger';
  }

statusLabel(user: User): string {
    if (user.status === 'INVITED') return 'Invit\u00e9';
    return user.actif ? 'Actif' : 'Inactif';
  }

  initials(user: User): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  }

  isInvited(user: User): boolean {
    return user.status === 'INVITED';
  }

  async confirmDelete(user: User): Promise<void> {
    const confirmed = await this.confirmService.confirm(
      `Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ? Cette action est irréversible.`,
      'Supprimer cet utilisateur ?',
    );
    if (confirmed) {
      this.metier.deleteUser(user.id).subscribe({
        next: () => { this.loadUsers(); this.toastr.showSuccessToastr('Utilisateur supprimé'); },
        error: () => this.toastr.showErrorToastr('Erreur lors de la suppression'),
      });
    }
  }
}
