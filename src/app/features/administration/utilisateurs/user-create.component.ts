import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/auth/models/role.model';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss',
})
export class UserCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly toastr = inject(ToastrCustomService);

  readonly roles = signal<Role[]>([]);
  readonly hidePassword = signal(true);
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    roleCode: ['', Validators.required],
  }, { validators: [this.passwordMatchValidator] });

  ngOnInit(): void {
    this.roleService.getAll().subscribe({ next: (r) => this.roles.set(r) });
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

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const { confirmPassword, ...data } = this.form.getRawValue();
    void confirmPassword;
    this.userService.create(data).subscribe({
      next: () => {
        this.toastr.showSuccessToastr('Utilisateur créé avec succès');
        this.router.navigate(['/administration/utilisateurs']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.showErrorToastr(err.error?.message || 'Erreur lors de la création');
      },
    });
  }
}