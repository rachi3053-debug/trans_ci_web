import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RoleMetier } from '../data-access/role.metier';

export interface AddEditRoleModalData {
  mode: 'create' | 'edit';
  role?: {
    id: string;
    code: string;
    libelle: string;
    description: string | null;
  };
}

@Component({
  selector: 'app-add-edit-role-modal',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
  ],
  templateUrl: './add-edit-role-modal.component.html',
  styleUrl: './add-edit-role-modal.component.scss',
})
export class AddEditRoleModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly activeModal = inject(NgbActiveModal);
  private readonly metier = inject(RoleMetier);

  data: AddEditRoleModalData = { mode: 'create' };

  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    libelle: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.role) {
      this.form.patchValue({
        code: this.data.role.code,
        libelle: this.data.role.libelle,
        description: this.data.role.description ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const raw = this.form.getRawValue();

    if (this.data.mode === 'create') {
      this.metier.createRole({ code: raw.code, libelle: raw.libelle, description: raw.description || undefined }).subscribe({
        next: () => this.activeModal.close(true),
        error: () => this.submitting.set(false),
      });
    } else if (this.data.role) {
      this.metier.updateRole(this.data.role.id, { code: raw.code, libelle: raw.libelle, description: raw.description || undefined }).subscribe({
        next: () => this.activeModal.close(true),
        error: () => this.submitting.set(false),
      });
    }
  }
}