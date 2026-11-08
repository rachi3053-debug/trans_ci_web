/**
 * Contrat d'environnement de l'application web.
 *
 * Ce fichier sert de source de vérité pour la forme du contrat : il doit exposer
 * exactement les mêmes clés que `environment.prod.ts`, sans valeur supplémentaire.
 * Le build de production substitue `environment.prod.ts` à ce fichier via les
 * `fileReplacements` déclarés dans `angular.json` (configuration `production`).
 *
 * Règle de sécurité : un fichier d'environnement Angular est compilé dans le
 * bundle JavaScript et lisible par le client. Aucun secret, clé d'API ni
 * identifiant ne doit donc y figurer — même masqué, car le bundle est public.
 *
 * @see environments/environment.prod.ts
 */
export const environment = {
  /** `true` uniquement en build optimisé (substitué par `environment.prod.ts`). */
  production: false,

  /**
   * URL de base de l'API backend, en chemin relatif et non en URL absolue.
   *
   * Le front est servi derrière un reverse-proxy qui expose l'API sous `/api`
   * (voir `proxy.conf.json` en développement, et la configuration du reverse-proxy
   * en production). Un chemin relatif garde donc le bundle valide quel que soit
   * l'hôte ou le port de déploiement : le navigateur résout `/api/v1` sur son
   * propre origine. Une URL absolue (`http://localhost:3000`) serait figée dans
   * le bundle et casserait tout déploiement non-local.
   */
  apiUrl: '/api/v1',

  /**
   * Clés de menu : pour chacune, `active` est forcé à `false` (avant filtrage du menu).
   *
   * Consommée par `app/common/menu-meta.ts`. Vide en dev ; la clé est également
   * déclarée dans `environment.prod.ts` afin que le contrat reste identique dans
   * les deux fichiers (l'accès est en outre défensif via `?? []` côté consommateur).
   */
  disabledMenuKeys: [] as string[],
};
