import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
  readonly hidePassword = signal(true);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    password: [''],
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
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(8)]);
      this.form.controls.roleCode.addValidators(Validators.required);
    }
    this.roleService.getAll().subscribe({ next: (r) => this.roles.set(r) });
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const raw = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.metier.createUser({
        nom: raw.nom,
        prenom: raw.prenom,
        email: raw.email,
        telephone: raw.telephone || undefined,
        password: raw.password,
        roleCodes: raw.roleCode ? [raw.roleCode] : [],
      }).subscribe({
        next: () => this.activeModal.close(true),
        error: () => this.submitting.set(false),
      });
    } else if (this.data.mode === 'edit' && this.data.user) {
      this.metier.updateUser(this.data.user.id, {
        nom: raw.nom,
        prenom: raw.prenom,
        email: raw.email,
        telephone: raw.telephone || undefined,
      }).subscribe({
        next: () => this.activeModal.close(true),
        error: () => this.submitting.set(false),
      });
    }
  }
}