import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserMetier } from '../data-access/user.metier';

export interface UserPasswordModalData {
  userId: string;
  email: string;
}

@Component({
  selector: 'app-user-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-password-modal.component.html',
  styleUrl: './user-password-modal.component.scss',
})
export class UserPasswordModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activeModal = inject(NgbActiveModal);
  private readonly metier = inject(UserMetier);

  data!: UserPasswordModalData;

  readonly hidePassword = signal(true);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onCancel(): void {
    this.activeModal.dismiss();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.metier.setPassword(this.data.userId, this.form.getRawValue().password).subscribe({
      next: () => this.activeModal.close(true),
      error: () => this.submitting.set(false),
    });
  }
}