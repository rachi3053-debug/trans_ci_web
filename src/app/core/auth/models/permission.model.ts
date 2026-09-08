export interface Permission {
  id: string;
  code: string;
  libelle: string;
  description: string | null;
  module: string;
  action: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}
