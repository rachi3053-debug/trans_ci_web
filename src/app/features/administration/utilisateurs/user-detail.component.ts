import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { User } from '../../../core/auth/models/user.model';
import { ToastrCustomService } from '../../../partager/toastr-custom-service';
import { ConfirmService } from '../../../core/helper/confirm.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrCustomService);
  private readonly confirmService = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);
  readonly editing = signal(false);
  readonly saving = signal(false);

  editForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadUser(id);
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.editForm.patchValue({ nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone || '' });
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/administration/utilisateurs']); },
    });
  }

  onSave(): void {
    const u = this.user();
    if (!u || this.editForm.invalid) return;
    this.saving.set(true);
    this.userService.update(u.id, this.editForm.getRawValue()).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.editing.set(false);
        this.saving.set(false);
        this.toastr.showSuccessToastr('Utilisateur mis à jour');
      },
      error: () => { this.saving.set(false); this.toastr.showErrorToastr('Erreur lors de la mise à jour'); },
    });
  }

  async confirmDelete(): Promise<void> {
    const u = this.user();
    if (!u) return;
    const confirmed = await this.confirmService.confirm(
      `Voulez-vous vraiment supprimer ${u.prenom} ${u.nom} ?`,
      'Supprimer cet utilisateur ?',
    );
    if (confirmed) {
      this.userService.delete(u.id).subscribe({
        next: () => { this.toastr.showSuccessToastr('Utilisateur supprimé'); this.router.navigate(['/administration/utilisateurs']); },
        error: () => this.toastr.showErrorToastr('Erreur lors de la suppression'),
      });
    }
  }
}