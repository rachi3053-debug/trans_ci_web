/**
 * Permission constants (TransCI).
 * Associe une route/code métier aux permissions exposées par l'API
 * (codes `MODULE:ACTION`, ex. USER:READ).
 */
export const PERMISSION_MAP: { [key: string]: string | string[] } = {
  utilisateurs: 'USER:READ',
  roles: 'ROLE:READ',
  permissions: 'PERMISSION:READ',
}

export function getFlattenedPermissions(permission: string): string[] {
  const value = PERMISSION_MAP[permission] ?? permission
  return Array.isArray(value) ? value : [value]
}