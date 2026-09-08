import { Injectable } from '@angular/core';
import ls from 'localstorage-slim';

/**
 * Stockage localStorage allégé (sans chiffrement).
 * L'encryption AES (crypto-js) utilisé côté eFarmOS n'est pas requis
 * pour transci-ci : les secrets applicatifs restent gérés côté serveur.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  public setObject(key: string, value: any): void {
    ls.set(key, value)
  }

  public getObject(key: string): any {
    return ls.get(key)
  }

  public deleteObject(key: string): void {
    ls.remove(key);
  }

  public clearAll(): void {
    ls.clear();
  }
}