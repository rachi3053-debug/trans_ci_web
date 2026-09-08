export interface Role {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
