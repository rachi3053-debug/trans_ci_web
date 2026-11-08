import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-activation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activation.component.html',
  styleUrl: './activation.component.scss',
})
export class ActivationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly validating = signal(true);
  readonly valid = signal(false);
  readonly submitted = signal(false);
  readonly invalidMessage = signal('');
  readonly email = signal('');
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

  constructor() {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = (params['token'] as string | undefined) ?? '';
      this.validate(token);
    });
  }

  private validate(token: string): void {
    if (!token) {
      this.invalidMessage.set(
        "Le lien d'invitation est incomplet. Vérifiez l'email reçu.",
      );
      this.validating.set(false);
      return;
    }
    this.auth.validateActivationToken(token).subscribe({
      next: (res) => {
        if (res.valid) {
          this.valid.set(true);
          this.email.set(res.email ?? '');
        } else {
          this.invalidMessage.set(
            "Ce lien d'invitation est invalide ou a expiré. Contactez votre administrateur pour le renouveler.",
          );
        }
        this.validating.set(false);
      },
      error: () => {
        this.invalidMessage.set(
          "Impossible de valider cette invitation. Réessayez ou contactez votre administrateur.",
        );
        this.validating.set(false);
      },
    });
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

    const token: string = this.route.snapshot.queryParams['token'] ?? '';
    const { password, confirmPassword } = this.form.getRawValue();
    this.auth.activateAccount(token, password, confirmPassword).subscribe({
      next: () => this.auth.logout(),
      error: () => this.submitted.set(false),
    });
  }
}