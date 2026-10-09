import { Injectable } from '@angular/core';

/**
 * Clé unique de l'enveloppe de session.
 */
const TOKEN_BUNDLE_KEY = 'transci_auth_bundle';

/**
 * Clés de la version précédente du service, où les tokens et le marqueur
 * « se souvenir » étaient stockés séparément. Aucun code du front ne les lit
 * désormais : elles sont purgées à l'instanciation (voir `purgeLegacyKeys`),
 * d'une part parce que leur présence fausserait les lectures, d'autre part
 * parce que laisser des jetons au format ancien en localStorage exposerait des
 * sessions persistantes alors que l'utilisateur avait choisi « ne pas se
 * souvenir ».
 */
const LEGACY_KEYS: readonly string[] = [
  'transci_access_token',
  'transci_refresh_token',
  'transci_remember',
  'transci_tenant_id',
];

/** Type de stockage retenu pour la session courante. */
type StorageKind = 'local' | 'session';

/**
 * Contenu de l'enveloppe de session. Une seule écriture JSON => un état
 * atomique : impossible d'avoir un access token sans son refresh token, ni
 * l'inverse.
 */
interface TokenBundle {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  remember: boolean;
}

/**
 * Gestion de la session : tokens d'accès, de rafraîchissement et tenant.
 *
 * STRATÉGIE DE STOCKAGE — « enveloppe JSON unique » (option A)
 * -----------------------------------------------------------
 * Tout l'état de session est sérialisé dans UNE seule entrée
 * `transci_auth_bundle`, placée dans `localStorage` OU dans `sessionStorage`
 * (jamais les deux : `persist()` retire l'enveloppe de l'autre stockage).
 *
 * Pourquoi ce choix plutôt que des clés séparées pilotées par un marqueur
 * `remember` : l'ancienne version lisait un marqueur `transci_remember` stocké
 * dans `localStorage` à chaque accès, pour choisir le stockage des tokens.
 * Marqueur et tokens vivaient dans deux endroits distincts, donc rien ne
 * garantissait leur cohérence :
 *   - un onglet connecté en mode session (tokens dans `sessionStorage`) perdait
 *     sa session silencieusement dès qu'un autre onglet écrivait
 *     `remember=true` dans le marqueur global (le `tenantId` souffrait du même
 *     défaut : l'en-tête `X-Tenant-Id` disparaissait des requêtes) ;
 *   - une écriture interrompue (quota atteint) laissait un access token sans
 *     refresh token : `getAccessToken()` renvoyait une valeur alors que
 *     `hasTokens()` répondait `false` ;
 *   - `clearTokens()` ne remettait pas le marqueur à un état neutre.
 *
 * Ici, l'emplacement du stockage est retrouvé en PROBANT les deux entrées :
 * `locate()` retourne celle qui contient réellement l'enveloppe. L'invariant
 * « un token écrit est toujours relu par la méthode de lecture » devient donc
 * structurel, au lieu de dépendre d'un marqueur à synchroniser.
 *
 * COMPORTEMENT `remember` (préservé)
 * - `remember = true`  → `localStorage` : la session survit à la fermeture du
 *   navigateur.
 * - `remember = false` → `sessionStorage` : la session disparaît à la fermeture
 *   de l'onglet.
 * - `clearTokens()` remet cet état à neutre : plus aucune enveloppe dans
 *   aucun stockage et plus aucune préférence en mémoire ; une session
 *   ultérieure repartira donc de la valeur par défaut (`localStorage`,
 *   équivalente à `remember = true`).
 *
 * ROBUSTESSE : tous les accès au stockage passent par des méthodes privées
 * `try/catch`. Un stockage indisponible ou saturé (navigation privée stricte,
 * quota dépassé, politique navigateur, contexte tiers) ne provoque jamais
 * d'exception : les lectures renvoient `null` et les écritures sont ignorées
 * silencieusement — la connexion n'échoue jamais, seule la persistance au
 * rechargement est perdue.
 *
 * MIGRATION : les clés de l'ancienne version sont purgées à l'instanciation.
 * Une session ouverte avant cette mise à jour est donc invalidée une fois et
 * l'utilisateur doit se reconnecter (comportement ponctuel et documenté).
 */
@Injectable({ providedIn: 'root' })
export class TokenService {
  /**
   * Préférence de stockage exprimée au login via `setRemember()`.
   * `null` = aucune préférence en mémoire : c'est l'emplacement réellement
   * occupé par l'enveloppe (s'il y en a une) qui fait foi, à défaut le
   * stockage par défaut.
   */
  private storagePreference: StorageKind | null = null;

  constructor() {
    this.purgeLegacyKeys();
  }

  // ---------------------------------------------------------------------------
  // Accès défensif au stockage
  // ---------------------------------------------------------------------------

  /** `localStorage` s'il est accessible, sinon `null` (stockage désactivé). */
  private safeLocal(): Storage | null {
    try {
      return localStorage;
    } catch {
      // Accès refusé (politique navigateur, iframe tierce, cookies bloqués).
      return null;
    }
  }

  /** `sessionStorage` s'il est accessible, sinon `null`. */
  private safeSession(): Storage | null {
    try {
      return sessionStorage;
    } catch {
      return null;
    }
  }

  /** Lecture sécurisée : `null` si la clé est absente ou le stockage inaccessible. */
  private safeRead(storage: Storage | null, key: string): string | null {
    if (!storage) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  /** Écriture sécurisée : ignore silencieusement quota atteint / stockage inaccessible. */
  private safeWrite(storage: Storage | null, key: string, value: string): void {
    if (!storage) return;
    try {
      storage.setItem(key, value);
    } catch {
      // QuotaExceededError ou stockage indisponible : la session reste valable
      // en mémoire, elle ne survivra simplement pas à un rechargement de page.
    }
  }

  /** Suppression sécurisée. */
  private safeRemove(storage: Storage | null, key: string): void {
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {
      // Rien à purger si le stockage est inaccessible.
    }
  }

  // ---------------------------------------------------------------------------
  // Enveloppe de session
  // ---------------------------------------------------------------------------

  private emptyBundle(): TokenBundle {
    return { accessToken: null, refreshToken: null, tenantId: null, remember: true };
  }

  /** Désérialise l'enveloppe, ou `null` si elle est absente ou corrompue. */
  private parseBundle(raw: string | null): TokenBundle | null {
    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    if (typeof parsed !== 'object' || parsed === null) return null;

    const candidate = parsed as Partial<TokenBundle>;
    const nonEmptyString = (value: unknown): string | null =>
      typeof value === 'string' && value.length > 0 ? value : null;

    return {
      accessToken: nonEmptyString(candidate.accessToken),
      refreshToken: nonEmptyString(candidate.refreshToken),
      tenantId: nonEmptyString(candidate.tenantId),
      remember: candidate.remember !== false,
    };
  }

  /**
   * Retrouve l'enveloppe en interrogeant les deux stockages. C'est le point
   * central de la stratégie : lecture ET écriture ciblent le même emplacement
   * parce que l'emplacement est déduit de l'enveloppe elle-même, et non d'un
   * marqueur externe. `persist()` garantit qu'une seule copie existe, donc
   * l'ordre de sondage est indifférent.
   */
  private locate(): { storage: Storage; bundle: TokenBundle } | null {
    const session = this.safeSession();
    if (session) {
      const bundle = this.parseBundle(this.safeRead(session, TOKEN_BUNDLE_KEY));
      if (bundle) return { storage: session, bundle };
    }

    const local = this.safeLocal();
    if (local) {
      const bundle = this.parseBundle(this.safeRead(local, TOKEN_BUNDLE_KEY));
      if (bundle) return { storage: local, bundle };
    }

    return null;
  }

  /**
   * Stockage à privilégier lorsqu'aucune session n'existe encore (donc au
   * moment où l'on ouvre une nouvelle session). Si le stockage préféré est
   * inaccessible, on se rabat sur l'autre plutôt que de perdre la session.
   */
  private defaultStorage(): Storage | null {
    if (this.storagePreference === 'session') {
      return this.safeSession() ?? this.safeLocal();
    }
    return this.safeLocal() ?? this.safeSession();
  }

  /** Écrit l'enveloppe et la retire de l'autre stockage (unicité garantie). */
  private persist(bundle: TokenBundle, storage: Storage | null): void {
    if (!storage) return;

    const session = this.safeSession();
    const local = this.safeLocal();
    if (session && session !== storage) this.safeRemove(session, TOKEN_BUNDLE_KEY);
    if (local && local !== storage) this.safeRemove(local, TOKEN_BUNDLE_KEY);

    this.safeWrite(storage, TOKEN_BUNDLE_KEY, JSON.stringify(bundle));
  }

  /** Applique `mutator` à l'état courant puis réécrit l'enveloppe. */
  private update(mutator: (bundle: TokenBundle) => TokenBundle): void {
    const located = this.locate();
    const storage = located ? located.storage : this.defaultStorage();
    this.persist(mutator(located ? located.bundle : this.emptyBundle()), storage);
  }

  /** Purge l'enveloppe des deux stockages. */
  private purgeBundle(): void {
    this.safeRemove(this.safeSession(), TOKEN_BUNDLE_KEY);
    this.safeRemove(this.safeLocal(), TOKEN_BUNDLE_KEY);
  }

  /** Purge les clés héritées de l'ancienne implémentation (migration). */
  private purgeLegacyKeys(): void {
    const storages = [this.safeSession(), this.safeLocal()];
    for (const key of LEGACY_KEYS) {
      for (const storage of storages) {
        this.safeRemove(storage, key);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // API publique (inchangée pour les appelants)
  // ---------------------------------------------------------------------------

  /**
   * Définit la durée de vie de la session : `true` = persistante
   * (`localStorage`), `false` = limitée à l'onglet (`sessionStorage`).
   *
   * Appelée par `AuthService.login()` juste avant `setTokens()` : elle ouvre
   * donc une nouvelle session et purge l'éventuelle enveloppe précédente des
   * deux stockages, afin que les jetons qui suivent atterrissent exactement là
   * où la durée de vie choisie l'exige.
   */
  setRemember(remember: boolean): void {
    this.storagePreference = remember ? 'local' : 'session';
    this.purgeBundle();
  }

  setAccessToken(token: string): void {
    this.update((bundle) => ({ ...bundle, accessToken: token || null }));
  }

  getAccessToken(): string | null {
    return this.locate()?.bundle.accessToken ?? null;
  }

  removeAccessToken(): void {
    this.update((bundle) => ({ ...bundle, accessToken: null }));
  }

  setRefreshToken(token: string): void {
    this.update((bundle) => ({ ...bundle, refreshToken: token || null }));
  }

  getRefreshToken(): string | null {
    return this.locate()?.bundle.refreshToken ?? null;
  }

  removeRefreshToken(): void {
    this.update((bundle) => ({ ...bundle, refreshToken: null }));
  }

  /**
   * Écrit les deux tokens en une seule opération (écriture atomique : plus
   * d'état intermédiaire où un seul des deux tokens serait présent).
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.update((bundle) => ({
      ...bundle,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    }));
  }

  setTenantId(tenantId: string | null): void {
    this.update((bundle) => ({ ...bundle, tenantId: tenantId || null }));
  }

  getTenantId(): string | null {
    return this.locate()?.bundle.tenantId ?? null;
  }

  clearTenantId(): void {
    this.update((bundle) => ({ ...bundle, tenantId: null }));
  }

  /**
   * Purge complète et neutre de la session : plus aucun token ni `tenantId`
   * dans l'un ou l'autre stockage (donc plus de jetons orphelins), et plus
   * aucune préférence « se souvenir » en mémoire.
   */
  clearTokens(): void {
    this.purgeBundle();
    this.storagePreference = null;
  }

  /**
   * Vrai si l'access token ET le refresh token sont tous deux présents. La
   * source est identique à `getAccessToken()` / `getRefreshToken()` : les deux
   * réponses ne peuvent donc pas diverger.
   */
  hasTokens(): boolean {
    const bundle = this.locate()?.bundle;
    return !!bundle?.accessToken && !!bundle?.refreshToken;
  }
}
