import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly submitted = signal(false);
  readonly done = signal(false);
  readonly invalidMessage = signal('');
  readonly token = signal('');
  readonly hidePassword = signal(true);
  readonly hideConfirm = signal(true);

  form = this.fb.nonNullable.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: [this.passwordMatchValidator] },
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'] as string | undefined;
    if (!token) {
      this.invalidMessage.set(
        "Le lien de réinitialisation est incomplet. Vérifiez l'email reçu.",
      );
      return;
    }
    this.token.set(token);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
      confirm.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update((v) => !v);
  }

  toggleConfirmVisibility(): void {
    this.hideConfirm.update((v) => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.set(true);
    const { password, confirmPassword } = this.form.getRawValue();
    this.auth.resetPassword(this.token(), password, confirmPassword).subscribe({
      next: () => {
        this.auth.logout();
        this.done.set(true);
        this.submitted.set(false);
      },
      error: (err) => {
        this.submitted.set(false);
        this.invalidMessage.set(
          err.error?.message ||
            "Ce lien est invalide ou a expiré. Refaites une demande.",
        );
      },
    });
  }
}