import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { UserMetier } from '../data-access/user.metier';
import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../core/auth/models/role.model';

export interface AddEditUserModalData {
  mode: 'create' | 'edit';
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    avatarPath?: string | null;
  };
}

@Component({
  selector: 'app-add-edit-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-user-modal.component.html',
  styleUrl: './add-edit-user-modal.component.scss',
})
export class AddEditUserModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly activeModal = inject(NgbActiveModal);
  private readonly metier = inject(UserMetier);
  private readonly roleService = inject(RoleService);

  data!: AddEditUserModalData;

  readonly roles = signal<Role[]>([]);
  readonly submitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly avatarPreview = signal('');
  readonly avatarUploading = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    roleCode: [''],
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.form.patchValue({
        nom: this.data.user.nom,
        prenom: this.data.user.prenom,
        email: this.data.user.email,
        telephone: this.data.user.telephone ?? '',
      });
    }
    if (this.data.mode === 'create') {
      this.form.controls.roleCode.addValidators(Validators.required);
    }
    this.roleService.getAll().subscribe({ next: (r) => this.roles.set(r) });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  }

  clearAvatar(): void {
    this.selectedFile.set(null);
    this.avatarPreview.set('');
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);

    const raw = this.form.getRawValue();

    const close = (avatarResponses?: { id: string; avatar: File }[]) => {
      if (avatarResponses && avatarResponses.length > 0) {
        this.avatarUploading.set(true);
        let chain: Promise<unknown> = Promise.resolve();
        for (const item of avatarResponses) {
          chain = chain.then(() =>
            lastValueFrom(this.metier.uploadAvatar(item.id, item.avatar)),
          );
        }
        chain
          .then(() => this.activeModal.close(true))
          .catch(() => this.activeModal.close(true))
          .finally(() => this.avatarUploading.set(false));
        return;
      }
      this.activeModal.close(true);
    };

    if (this.data.mode === 'create') {
      this.metier.createUser({
        nom: raw.nom,
        prenom: raw.prenom,
        email: raw.email,
        telephone: raw.telephone || undefined,
        roleCode: raw.roleCode || undefined,
      }).subscribe({
        next: (created) => {
          this.submitting.set(false);
          close(
            this.selectedFile()
              ? [{ id: created.id, avatar: this.selectedFile()! }]
              : undefined,
          );
        },
        error: () => {
          this.submitting.set(false);
        },
      });
    } else if (this.data.mode === 'edit' && this.data.user) {
      this.metier.updateUser(this.data.user.id, {
        nom: raw.nom,
        prenom: raw.prenom,
        email: raw.email,
        telephone: raw.telephone || undefined,
      }).subscribe({
        next: () => {
          this.submitting.set(false);
          close(
            this.selectedFile()
              ? [{ id: this.data.user!.id, avatar: this.selectedFile()! }]
              : undefined,
          );
        },
        error: () => {
          this.submitting.set(false);
        },
      });
    }
  }
}