import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserMetier } from '../data-access/user.metier';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/auth/models/role.model';

export interface UserRolesModalData {
  userId: string;
  userName: string;
}

@Component({
  selector: 'app-user-roles-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-roles-modal.component.html',
  styleUrl: './user-roles-modal.component.scss',
})
export class UserRolesModalComponent implements OnInit {
  private readonly activeModal = inject(NgbActiveModal);
  private readonly metier = inject(UserMetier);
  private readonly roleService = inject(RoleService);

  data!: UserRolesModalData;

  readonly roles = signal<Role[]>([]);
  readonly selectedCodes = signal<string[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  ngOnInit(): void {
    this.roleService.getAll().subscribe({
      next: (all) => this.roles.set(all),
      complete: () => {
        this.metier.getUserRoles(this.data.userId).subscribe({
          next: (assigned) => this.selectedCodes.set(assigned.map((r) => r.code)),
          complete: () => this.loading.set(false),
        });
      },
    });
  }

  onToggleRole(code: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedCodes.update((codes) => (checked ? [...codes, code] : codes.filter((c) => c !== code)));
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onSave(): void {
    this.submitting.set(true);
    this.metier.assignRoles(this.data.userId, this.selectedCodes()).subscribe({
      next: () => this.activeModal.close(true),
      error: () => this.submitting.set(false),
    });
  }
}