import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { UserMetier } from '../data-access/user.metier';
import { RoleService } from '../../../../core/services/role.service';
import { Role, isAssignableRole } from '../../../../core/auth/models/role.model';

export interface UserRolesModalData {
  userId: string;
  userName: string;
  /**
   * Tenant de l'utilisateur ciblé.
   *
   * `null` = compte ROOT / compte hors tenant : ses rôles sont des rôles GLOBAUX
   * et le serveur refuse (403) toute réaffectation via `POST /users/:id/roles`
   * (`UsersService.requireTenantScopeForRoles`). On bloque alors l'action au
   * lieu de la filtrer, afin de ne JAMAIS envoyer une liste de codes qui
   * remplacerait les rôles existants par du vide.
   */
  userTenantId: string | null;
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
  readonly assignedRoles = signal<Role[]>([]);
  readonly selectedCodes = signal<string[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  /** Erreur de chargement de la liste des rôles / des rôles affectés. */
  readonly loadFailed = signal(false);
  /** Message d'erreur affiché à l'utilisateur (jamais d'échec muet). */
  readonly saveError = signal<string | null>(null);

  /** Tenant de l'utilisateur ciblé (`null` = compte ROOT / hors tenant). */
  private readonly targetTenantId = signal<string | null>(null);

  /**
   * Rôles réellement assignables : on EXCLUT les rôles globaux
   * (`tenantId === null`), que `GET /roles` renvoie à un ROOT alors que
   * `POST /users/:id/roles` les refuse (403).
   *
   * Décision d'affichage : les rôles globaux ne sont PAS masqués, ils sont
   * listés à part, désactivés et étiquetés « rôle système — non assignable ».
   * Les faire disparaître silencieusement donnerait l'impression d'une liste
   * incomplète ou d'un bug ; l'utilisateur comprend ainsi pourquoi le rôle ROOT
   * n'est pas cochable.
   */
  readonly assignableRoles = computed(() => this.roles().filter(isAssignableRole));
  readonly globalRoles = computed(() => this.roles().filter((r) => !isAssignableRole(r)));

  /** L'utilisateur ciblé possède déjà au moins un rôle global. */
  readonly hasGlobalRole = computed(() =>
    this.assignedRoles().some((r) => !isAssignableRole(r)),
  );

  /**
   * Affectation interdite : compte ROOT / hors tenant, ou rôle global déjà détenu.
   * Dans ce cas les cases sont en lecture seule et l'enregistrement est bloqué.
   */
  readonly readOnly = computed(
    () => this.targetTenantId() === null || this.hasGlobalRole(),
  );

  /** Aucun rôle assignable disponible (ex. périmètre d'un autre tenant). */
  readonly noAssignableRole = computed(() => this.assignableRoles().length === 0);

  readonly saveDisabled = computed(
    () =>
      this.loading() ||
      this.submitting() ||
      this.readOnly() ||
      this.loadFailed() ||
      this.noAssignableRole(),
  );

  ngOnInit(): void {
    this.targetTenantId.set(this.data.userTenantId);
    this.loading.set(true);

    // Chargement parallèle : sans la liste des rôles déjà affectés, on ne peut
    // ni pré-cocher correctement, ni détecter un rôle global détenu par la cible.
    forkJoin({
      roles: this.roleService.getAll(),
      assigned: this.metier.getUserRoles(this.data.userId),
    }).subscribe({
      next: ({ roles, assigned }) => {
        this.roles.set(roles);
        this.assignedRoles.set(assigned);
        this.selectedCodes.set(assigned.map((r) => r.code));
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  isSelected(code: string): boolean {
    return this.selectedCodes().includes(code);
  }

  onToggleRole(code: string, event: Event): void {
    // Défense : aucun changement d'état si l'affectation est interdite, et
    // jamais de code de rôle global dans la sélection (il déclencherait un 403).
    if (this.readOnly()) return;
    if (!this.assignableRoles().some((r) => r.code === code)) return;

    const checked = (event.target as HTMLInputElement).checked;
    this.saveError.set(null);
    this.selectedCodes.update((codes) =>
      checked
        ? codes.includes(code)
          ? codes
          : [...codes, code]
        : codes.filter((c) => c !== code),
    );
  }

  onCancel(): void {
    this.activeModal.dismiss();
  }

  /**
   * Construit le payload d'affectation.
   *
   * GARDE ANTI-PERTE DE RÔLE : `POST /users/:id/roles` REMPLACE
   * intégralement les rôles de l'utilisateur. Le payload est donc construit par
   * intersection entre la sélection courante et les seuls rôles ASSIGNABLES :
   *
   * - un code de rôle global ne peut structurellement pas y entrer
   *   (donc pas de 403) ;
   * - on n'envoie jamais une liste vide « par défaut » pour un compte ROOT,
   *   dont le rôle ROOT serait sinon supprimé.
   */
  private payloadCodes(): string[] {
    const assignableCodes = new Set(this.assignableRoles().map((r) => r.code));
    return this.selectedCodes().filter((code) => assignableCodes.has(code));
  }

  onSave(): void {
    this.saveError.set(null);

    // 1. Affectation interdite (compte ROOT / hors tenant, ou rôle global détenu).
    if (this.readOnly()) {
      this.saveError.set(
        'Les rôles système ne sont pas modifiables depuis cette interface.',
      );
      return;
    }

    // 2. Aucun rôle assignable dans le périmètre courant : envoi inutile.
    if (this.noAssignableRole()) {
      this.saveError.set(
        'Aucun rôle assignable n\'est disponible dans le périmètre courant : enregistrement impossible.',
      );
      return;
    }

    const codes = this.payloadCodes();

    // 3. GARDE ANTI-DÉPOUILLEMENT : `assignRoles` remplace TOUS les rôles.
    //    Envoyer une liste vide à un utilisateur qui possède déjà des rôles le
    //    priverait de ses accès. On BLOQUE (et on explique) au lieu d'envoyer.
    //    L'utilisateur n'ayant effectivement aucun rôle, `[]` est sans effet.
    if (codes.length === 0 && this.assignedRoles().length > 0) {
      this.saveError.set(
        'Enregistrement refusé : aucun rôle sélectionné alors que cet utilisateur en possède déjà. ' +
          'La plateforme remplace tous les rôles à chaque enregistrement — réaffectez au moins un rôle pour éviter de le priver de ses accès.',
      );
      return;
    }

    this.submitting.set(true);
    this.metier.assignRoles(this.data.userId, codes).subscribe({
      next: () => this.activeModal.close(true),
      error: () => {
        this.submitting.set(false);
        this.saveError.set(
          'Erreur lors de l\'enregistrement des rôles. Aucune modification n\'a été appliquée.',
        );
      },
    });
  }
}
