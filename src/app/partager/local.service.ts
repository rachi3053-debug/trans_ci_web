import { StorageService } from '@/app/partager/storage.service';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private myData: any;
  constructor(
    private storageService: StorageService
  ) {

  }

  setJsonValue(key: string, value: any) {
    this.storageService.setObject(key, value);
  }
  // Get the json value from local storage
  getJsonValue(key: string) {
    return this.storageService.getObject(key);
  }
  // Clear the local storage
  clearAll() {
    return this.storageService.clearAll();
  }
  // Delete object in the local storage
  deleteObject(key: string) {
    return this.storageService.deleteObject(key);
  }

  /**
   * Function recupérant et décodant le token de l'utilisateur connecté
   * ---------------
   */
  getUserConnectedSession = (): any => {
    const userData = this.getJsonValue('user');
    // The entire user object is now stored in userData.user_info
    return userData.user_info;
  }

  setData(data: any) {
    this.myData = data;
  }

  getData() {
    return this.myData;
  }

  /** Le format de la response sera
   * {
   *     "currency": "CFA",
   *     "languages": "French",
   *     "timezones": "UTC",
   *     "indicatif": "225",
   *     "defaultconditionpaiement": 31,
   *     "codepays": "CIV"
   * }
   */
  getUserConnectedCompagnieSettings = (): any => {
    const data = this.getUserConnectedSession();
    return data.parametre_compagnie;
  }
  getUserConnectedUserInfo = (): any => {
    const userData = this.getJsonValue('user');
    // The user info is directly available in user_info
    return userData.user_info;
  }

  /**
   * Met à jour les URLs logo / logo toggle du tenant dans la session (`user`)
   * pour aligner le stockage local sur le serveur (sans reconnexion).
   */
  patchSessionTenantLogos(logo: string | null, logoToggle: string | null): void {
    const raw = this.getJsonValue('user');
    if (!raw || typeof raw !== 'object') {
      return;
    }
    const apply = (info: any) => {
      if (!info || typeof info !== 'object') {
        return;
      }
      if (info.tenant != null && typeof info.tenant === 'object') {
        info.tenant.logo = logo;
        info.tenant.logoToggle = logoToggle;
      }
      info.tenantLogo = logo;
      info.tenantLogoToggle = logoToggle;
    };
    apply(raw.user_info);
    apply(raw.user);
    this.setJsonValue('user', raw);
  }
}
