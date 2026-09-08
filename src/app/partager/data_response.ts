export interface HttpDataResponse {
  status:   boolean;
  hasError?: boolean;
  count:    number;
  data:    any[];
  message:    string;
  page?:     number
  statuscode: number;
}
export interface Status {
  code?:    string;
  message?: string;
  disabled: boolean;
}
export class userPermission {
  public static canAdd(route: string): string {
    return route + '_ajouter';
  }
  public static canManageFicheAgent(route: string): string {
    return route + '_fiche agent';
  }
  public static canHistorical(route: string): string {
    return route + '_historique';
  }

  public static canUpdate(route: string): string {
    return route + '_modifier';
  }
  public static canCreateAcces(route: string): string {
    return route + '_access';
  }
  public static canManageSite(route: string): string {
    return route + '_manage site client';
  }
  public static canReadFicheClient(route: string): string {
    return route + '_fiche client';
  }
  public static canRead(route: string): string {
    return route + '_lecture';
  }
  public static canBloqueAccess(route: string): string {
    return route + '_bloquer';
  }

  public static canDelete(route: string): string {
    return route + '_supprimer';
  }
  public static canJustify(route: string): string {
    return route + '_justifier';
  }
  public static canDeleteJustify(route: string): string {
    return route + '_supprimer justification';
  }
  public static canOnOff(route: string): string {
    return route + '_activer';
  }
  public static canHandleArret(route: string): string {
    return route + '_manage arret';
  }
  public static canHandleArretTravail(route: string): string {
    return route + '_arret travail';
  }
  public static canHandleArretMaladie(route: string): string {
    return route + '_arret maladie';
  }
  public static canHandleSanction(route: string): string {
    return route + '_sanction';
  }
  public static canUpdateReporteur(route: string): string {
    return route + '_ajouter reporteur';
  }
  public static canDownload(route: string): string {
    return route + '_telecharger';
  }
  public static canVueRh(route: string): string {
    return route + '_vue rh';
  }
}
