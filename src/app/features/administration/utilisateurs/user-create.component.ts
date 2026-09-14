import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  readonly submitting = signal(false);

  form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    roleCode: ['', Validators.required],
  });

  ngOnInit(): void {
    this.roleService.getAll().subscribe({ next: (r) => this.roles.set(r) });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const data = this.form.getRawValue();
    this.userService.create(data).subscribe({
      next: () => {
        this.toastr.showSuccessToastr('Utilisateur créé. Invitation envoyée par email');
        this.router.navigate(['/administration/utilisateurs']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastr.showErrorToastr(err.error?.message || 'Erreur lors de la création');
      },
    });
  }
}