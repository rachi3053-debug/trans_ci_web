export const environment = {
  production: false,
  url: '',
  apiUrl: '/api/v1',
  apiUrlWebSocket: 'http://localhost:3000',
  authenticated: 'authenticated',
  CLIENT_ID: "",
  CLIENT_SECRET: "",
  API_KEY: '9C95A9EB5EC9D2731B6B84F13451B',
  /**
   * Clés de menu : pour chacune, `active` est forcé à `false` (avant filtrage du menu).
   * Vide en dev ; voir environment.prod.ts pour la prod.
   */
  disabledMenuKeys: [] as string[],
};
