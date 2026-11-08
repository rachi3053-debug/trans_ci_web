export interface Role {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
  /**
   * Tenant propriétaire du rôle (colonne `tenant_id` de l'entité backend `Role`).
   *
   * `null` = rôle GLOBAL (hors tenant, cas du rôle ROOT). L'API backend refuse
   * explicitement (403) l'attribution d'un tel rôle via `POST /users/:id/roles`
   * (`UsersService.requireTenantScopeForRoles` puis `UsersService.resolveRoles`).
   *
   * L'UI DOIT donc considérer `tenantId === null` comme « non assignable » et ne
   * jamais envoyer un tel code dans un payload d'affectation de rôles.
   */
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Un rôle n'est assignable à un utilisateur que s'il appartient à un tenant.
 *
 * Source de vérité : `trans_ci_api/src/modules/users/users.service.ts`
 * (`requireTenantScopeForRoles` / `resolveRoles`) qui rejette tout code
 * correspondant à un rôle global (`tenant_id IS NULL`).
 */
export function isAssignableRole(role: Role): boolean {
  return role.tenantId !== null;
}
