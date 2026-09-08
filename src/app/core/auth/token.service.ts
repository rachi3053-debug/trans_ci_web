import { Injectable } from '@angular/core';

const ACCESS_TOKEN_KEY = 'transci_access_token';
const REFRESH_TOKEN_KEY = 'transci_refresh_token';
const REMEMBER_KEY = 'transci_remember';

@Injectable({ providedIn: 'root' })
export class TokenService {
  setRemember(remember: boolean): void {
    localStorage.setItem(REMEMBER_KEY, String(remember));
    if (!remember) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  private getStorage(): Storage {
    const remember = localStorage.getItem(REMEMBER_KEY);
    return remember === 'false' ? sessionStorage : localStorage;
  }

  setAccessToken(token: string): void {
    this.getStorage().setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): string | null {
    return this.getStorage().getItem(ACCESS_TOKEN_KEY);
  }

  removeAccessToken(): void {
    this.getStorage().removeItem(ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.getStorage().setItem(REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return this.getStorage().getItem(REFRESH_TOKEN_KEY);
  }

  removeRefreshToken(): void {
    this.getStorage().removeItem(REFRESH_TOKEN_KEY);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  hasTokens(): boolean {
    const storage = this.getStorage();
    return !!storage.getItem(ACCESS_TOKEN_KEY) && !!storage.getItem(REFRESH_TOKEN_KEY);
  }
}