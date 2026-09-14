export type UserStatus = 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  status?: UserStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenantId: string | null;
  avatarPath?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  isRoot?: boolean;
  tenantId?: string | null;
  tenantCode?: string | null;
  [key: string]: unknown;
}
