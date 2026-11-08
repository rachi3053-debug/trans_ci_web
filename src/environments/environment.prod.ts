/**
 * Contrat d'environnement pour le build de production.
 *
 * Ce fichier remplace `environment.ts` lors du build de production grâce aux
 * `fileReplacements` déclarés dans `angular.json`
 * (projet `web`, cible `build`, configuration `production`).
 *
 * Il doit exposer exactement les mêmes clés que `environment.ts` : une clé
 * absente ici deviendrait `undefined` dans le bundle de production et produirait
 * des URLs du type `undefined/users`. Aucune valeur sensible ne doit y figurer,
 * le fichier étant compilé dans le bundle JavaScript livré au client.
 *
 * @see environments/environment.ts
 */
export const environment = {
  /** `true` en production : active les optimisations et le mode Angular dev désactivé. */
  production: true,

  /**
   * URL de base de l'API backend, en chemin relatif et non en URL absolue.
   *
   * Identique à celle du fichier de développement : le front est servi derrière
   * un reverse-proxy qui expose l'API sous `/api` sur la même origine que
   * l'application (en dev, `proxy.conf.json` mappe `/api` vers
   * `http://localhost:3000`). Le chemin relatif `/api/v1` est donc résolu par le
   * navigateur sur l'hôte de déploiement courant, sans URL absolue figée dans
   * le bundle et sans CORS.
   */
  apiUrl: '/api/v1',

  /** Même contrat que `environment.ts` : clé consommée par `app/common/menu-meta.ts`. */
  disabledMenuKeys: [] as string[],
};
