import {HttpDataResponse} from '@/app/partager/data_response';

export class globalSessionName {
  static admin: 'admin';
}

export const defaultImage = 'assets/images/photo.jpg';
export const attentionIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAZlBMVEX/////AAD+/v7/8fHx5+fn19fXzs7OysrKjo6OjY2NjMzMzDw8PBwcG+vr6CgoKqqqqXl5cXFxfU1NTd3d3p6enZ2dnV1dWmpqaJiYl3d3doaGihoaG9vb1dXV3GxsaYmJhRQjRZAAAAJXRSTlMAAQMEBQYICQoLDA0ODxAREhMUFRcYGRobHB0eHyAiIyQlNptuWqEAAABtSURBVHjaDc7JEoAwDAXQ2ZrY2P//pwpGbTNSaLJNwNIsRS5uJ1gUxkXeH3pBkE0QqctQhUj6s8R9KwY1cpP/F5s8Fr2cgnEqhCioIefacqXs1kZ25Y3eH+MCF49x4M6ZoAAAAASUVORK5CYII=';
export const defaultNight = 'assets/images/night_worker_icon.svg';
export const defaultDays = 'assets/images/sunday_worker_icon.svg';

export class SessionConstant {
  static user = 'user';
  static userInfos: 'userinfo';
  static apiUrl: 'userinfo';
}

export enum SeverityMessage {
  info = 'info',
  success = 'success',
  warning = 'war',
  error = 'error',
  summary = 'Notification'
}


export enum TypeAction{
  insert = 'Insert',
  update = 'Update',
  delete = 'Delete'
}

export enum OperationMessage{
  success = 'Opération effectuée avec succès',
  warning = 'Error lors de l\'opération',
  error = 'Une Erreur est survenue! Contactez l\'administrateur'
}


export enum permissionModuleList {
  Dasboard= 'dashboard',
  Connexion= 'connect',
  Module = 'module',
  Fonctionnalites = 'fonctionnalites',
  Compagnie= 'compagnie',
  Client= 'client',
  Profils= 'profils',
  MaritalStatus = 'situation matrimoniale',
  ContractType = 'type de contrat',
  TypePermission = 'type permission',
  CategorieBulletin = 'categorie bulletin salaire',
  CritereEvaluation = 'critere notation',
  DemandePermission = 'demande permission',
  JourFerie = 'jour ferie',
  PaymentMethod = 'moyen de paiement',
  Bank = 'banque',
  Ville = 'ville',
  PeriodeTravail = 'periode travail',
  Zone = 'zone',
  Absence = 'absence',
  ArretTravail = 'arret travail',
  ArretMaladie = 'arret maladie',
  JourSupplementaire = 'jour supplementaire',
  Notation = 'notation',
  RegimeType = 'type de régime',
  TypePrime = 'type de prime',
  TypeSanction = 'type de sanction',
  Sanction = 'sanction',
  Site = 'site',
  Employe = 'employe',
  DemandeConge = 'demande conge',
  DemandeFinanciere = 'demande financiere',
  Document = 'document',
  Recensement = 'recensement',
  TypeConge = 'type de conge',
  Anneefiscale = 'annees fiscales',
  Workflows = 'workflows',
  EmployeConge = 'employe conge',
  Bareme = 'bareme',
  BaremeImpot = 'bareme impot',
  CreditImpot = 'credit impot',
}

export let statusCompte: any[] = [
  { libelle: 'Verrouiller', status: 1 },
  { libelle: 'Déverrouiller', status: 0 },
];

export enum dataTableConfig {
  page = 1,
  size = 10,
  pageIndex = 1,
  totalElements = 0,
}

export enum dataTableModalConfig {
  page = 1,
  size = 5,
  pageIndex = 1,
  totalElements = 0,
}

export enum buttonTitle {
  add = "Nouveau",
  upload = "Upload",
  update = "Modifier",
  valid = "Valider",
  close = "Fermer",
  cancel = "Annuler",
  exporter = "Exporter",
  filtre = "Filtrer",
  bulletinSalaire = "Bulletin de salaire",
}

export enum defaultMessage {
  emptyData = "Oups aucune donnée trouvée",
}

export let errorResponse: HttpDataResponse = {
  count: 0,
  data: [],
  message: 'Une erreure est survenue',
  status: false,
  statuscode: 500
};


export enum dataCodification {
 agentCode = 'agt',
 controllerCode = 'Controller',
}
