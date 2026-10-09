import { TokenService } from './token.service';

/**
 * Clé unique de l'enveloppe de session.
 *
 * Reproduite volontairement en dur : un spec doit échouer si la STRATÉGIE de
 * stockage change, pas seulement si la logique se casse en silence.
 */
const BUNDLE_KEY = 'transci_auth_bundle';

/** Clés de l'ancienne implémentation, purgées à l'instanciation. */
const LEGACY_KEYS: readonly string[] = [
  'transci_access_token',
  'transci_refresh_token',
  'transci_remember',
  'transci_tenant_id',
];

/** Nom des globales lues directement par `TokenService`. */
type StorageSlot = 'localStorage' | 'sessionStorage';

// ---------------------------------------------------------------------------
// Faux `Storage`
// ---------------------------------------------------------------------------

/**
 * Implémentation factice d'un `Storage`, fondée sur une `Map` et pilotable
 * pour reproduire les pannes réelles (quota atteint, stockage désactivé).
 *
 * Elle ne déclare pas `implements Storage` : l'interface du DOM impose une
 * signature d'index `[name: string]: any` qu'une classe ne peut pas fournir de
 * façon compatible. La surface exposée ci-dessous (`length`, `getItem`,
 * `setItem`, `removeItem`, `clear`, `key`) est exactement celle que
 * `TokenService` consomme.
 */
class FakeStorage {
  private readonly entries = new Map<string, string>();

  /** Erreur levée par `setItem` : reproduit un `QuotaExceededError`. */
  writeError: Error | null = null;

  /** Erreur levée par `getItem` / `removeItem` : reproduit un `SecurityError`. */
  readError: Error | null = null;

  get length(): number {
    return this.entries.size;
  }

  getItem(key: string): string | null {
    if (this.readError) throw this.readError;
    return this.entries.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    // Lève AVANT toute mutation, comme le vrai `Storage` : une écriture
    // interrompue ne doit pas laisser d'entrée à moitié écrite.
    if (this.writeError) throw this.writeError;
    this.entries.set(key, value);
  }

  removeItem(key: string): void {
    if (this.readError) throw this.readError;
    this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }

  // -- Outils d'assertion ---------------------------------------------------

  /** Lecture brute, insensible aux pannes simulées. */
  peek(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  /** Toutes les clés présentes, dans l'ordre d'insertion. */
  keys(): string[] {
    return [...this.entries.keys()];
  }

  /** Enveloppe désérialisée, ou `null` si la clé est absente. */
  bundle(): Record<string, unknown> | null {
    const raw = this.peek(BUNDLE_KEY);
    return raw === null ? null : (JSON.parse(raw) as Record<string, unknown>);
  }
}

// ---------------------------------------------------------------------------
// Substitution des globales de stockage
// ---------------------------------------------------------------------------

/**
 * Chrome expose `localStorage` / `sessionStorage` comme propriété PROPRE de
 * l'objet `window` — et non sur `Window.prototype` — et son descripteur est
 * `configurable`. Un `Object.defineProperty(globalThis, ...)` la masque donc
 * réellement pour le code compilé, dont l'identifiant nu (`localStorage`)
 * est résolu par la chaîne de portées du global. Vérifié dans cet
 * environnement (Karma + Chrome Headless 154).
 *
 * Même mécanique pour les pannes : un getter qui lève reproduit un
 * `SecurityError` à l'accès, ce que `safeLocal()` / `safeSession()`
 * encompassent dans leur `try/catch`.
 */
const installed: Array<{ slot: StorageSlot; descriptor: PropertyDescriptor | undefined }> = [];

function install(slot: StorageSlot, read: () => unknown): void {
  if (!installed.some((entry) => entry.slot === slot)) {
    installed.push({ slot, descriptor: Object.getOwnPropertyDescriptor(globalThis, slot) });
  }
  Object.defineProperty(globalThis, slot, { configurable: true, get: read });
}

/** Substitue la globale par un stockage factice fonctionnel. */
function useStorage(slot: StorageSlot, storage: FakeStorage): void {
  install(slot, () => storage);
}

/** Substitue la globale par un getter qui lève : stockage inaccessible. */
function denyStorage(slot: StorageSlot, error: Error): void {
  install(slot, () => {
    throw error;
  });
}

/** Restaure l'état exact du navigateur pour toutes les globals substituées. */
function restoreStorages(): void {
  for (const entry of installed.splice(0)) {
    if (entry.descriptor) {
      Object.defineProperty(globalThis, entry.slot, entry.descriptor);
    } else {
      Reflect.deleteProperty(globalThis, entry.slot);
    }
  }
}

/** Nombre de stockages qui contiennent effectivement une enveloppe. */
function envelopeCopies(...storages: FakeStorage[]): number {
  return storages.filter((storage) => storage.peek(BUNDLE_KEY) !== null).length;
}

/**
 * Simule un rechargement de page : nouvelle instance du service, qui ne peut
 * connaître que ce qui est réellement présent dans les stockages.
 */
function reload(): TokenService {
  return new TokenService();
}

function quotaError(): DOMException {
  return new DOMException('Exceeding quota', 'QuotaExceededError');
}

function securityError(): DOMException {
  return new DOMException('Access is denied for this document', 'SecurityError');
}

// ---------------------------------------------------------------------------

describe('TokenService', () => {
  let local: FakeStorage;
  let session: FakeStorage;

  beforeEach(() => {
    local = new FakeStorage();
    session = new FakeStorage();
    useStorage('localStorage', local);
    useStorage('sessionStorage', session);
  });

  afterEach(() => {
    restoreStorages();
  });

  // -------------------------------------------------------------------------
  describe("Stratégie de stockage selon `remember`", () => {
    it('conserve une session d\'onglet (remember = false) après rechargement', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-1', 'refresh-1');
      service.setTenantId('tenant-1');

      // L'enveloppe est dans sessionStorage, et nowhere ailleurs.
      expect(session.keys()).toEqual([BUNDLE_KEY]);
      expect(local.keys()).toEqual([]);
      expect(envelopeCopies(local, session)).toBe(1);

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-1');
      expect(reloaded.getRefreshToken()).toBe('refresh-1');
      expect(reloaded.getTenantId()).toBe('tenant-1');
      expect(reloaded.hasTokens()).toBeTrue();
    });

    it('conserve une session persistante (remember = true) après rechargement', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-2', 'refresh-2');
      service.setTenantId('tenant-2');

      // L'enveloppe est dans localStorage : elle survit à la fermeture.
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(session.keys()).toEqual([]);
      expect(envelopeCopies(local, session)).toBe(1);

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-2');
      expect(reloaded.getRefreshToken()).toBe('refresh-2');
      expect(reloaded.getTenantId()).toBe('tenant-2');
      expect(reloaded.hasTokens()).toBeTrue();
    });

    it('purge les DEUX stockages après clearTokens() sur une session d\'onglet', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-3', 'refresh-3');
      service.setTenantId('tenant-3');
      expect(session.keys()).toEqual([BUNDLE_KEY]);

      service.clearTokens();

      // Plus rien dans aucun des deux stockages : pas de jeton orphelin.
      expect(session.keys()).toEqual([]);
      expect(local.keys()).toEqual([]);
      expect(
        [...session.keys(), ...local.keys()].filter((key) => key.startsWith('transci_')),
      ).toEqual([]);

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBeNull();
      expect(reloaded.getRefreshToken()).toBeNull();
      expect(reloaded.getTenantId()).toBeNull();
      expect(reloaded.hasTokens()).toBeFalse();
    });

    it('purge les DEUX stockages après clearTokens() sur une session persistante', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-4', 'refresh-4');
      service.setTenantId('tenant-4');
      expect(local.keys()).toEqual([BUNDLE_KEY]);

      service.clearTokens();

      expect(local.keys()).toEqual([]);
      expect(session.keys()).toEqual([]);

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBeNull();
      expect(reloaded.getRefreshToken()).toBeNull();
      expect(reloaded.getTenantId()).toBeNull();
      expect(reloaded.hasTokens()).toBeFalse();
    });

    it('remet la préférence de stockage à neutre après clearTokens()', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-5', 'refresh-5');
      expect(session.keys()).toEqual([BUNDLE_KEY]);

      service.clearTokens();

      // Session suivante sans préférence explicite : stockage par défaut.
      service.setTokens('access-6', 'refresh-6');
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(session.keys()).toEqual([]);

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-6');
      expect(reloaded.getRefreshToken()).toBe('refresh-6');
    });

    it('setRemember() purge l\'enveloppe précédente des deux stockages', () => {
      const service = new TokenService();
      // Sans préférence, l'écriture part dans le stockage par défaut.
      service.setTokens('access-7', 'refresh-7');
      expect(local.keys()).toEqual([BUNDLE_KEY]);

      // Changer de durée de vie ouvre une nouvelle session : l'ancienne
      // enveloppe ne doit pas subsister.
      service.setRemember(false);
      expect(local.keys()).toEqual([]);
      expect(session.keys()).toEqual([]);

      service.setTokens('access-8', 'refresh-8');
      expect(session.keys()).toEqual([BUNDLE_KEY]);
      expect(local.keys()).toEqual([]);
      expect(reload().getAccessToken()).toBe('access-8');
    });
  });

  // -------------------------------------------------------------------------
  describe("Cohérence de l'API de lecture", () => {
    it('reflète fidèlement un état partiel « refresh token seul »', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setRefreshToken('refresh-seul');

      expect(service.getRefreshToken()).toBe('refresh-seul');
      expect(service.getAccessToken()).toBeNull();
      expect(service.hasTokens()).toBeFalse();

      const reloaded = reload();
      expect(reloaded.getRefreshToken()).toBe('refresh-seul');
      expect(reloaded.getAccessToken()).toBeNull();
      expect(reloaded.hasTokens()).toBeFalse();
    });

    it('reflète fidèlement un état partiel « access token seul »', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setAccessToken('access-seul');

      expect(service.getAccessToken()).toBe('access-seul');
      expect(service.getRefreshToken()).toBeNull();
      expect(service.hasTokens()).toBeFalse();

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-seul');
      expect(reloaded.getRefreshToken()).toBeNull();
      expect(reloaded.hasTokens()).toBeFalse();
    });

    it('n\'a jamais d\'access token sans refresh token (écriture atomique)', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-9', 'refresh-9');

      // hasTokens() et les deux accesseurs partagent la même source : ils ne
      // peuvent pas diverger. C'était précisément le symptôme de l'ancien
      // bug (écriture interrompue => access sans refresh).
      expect(service.hasTokens()).toBeTrue();
      expect(service.getAccessToken()).toBe('access-9');
      expect(service.getRefreshToken()).toBe('refresh-9');

      const envelope = local.bundle();
      expect(envelope).not.toBeNull();
      expect(envelope?.['accessToken']).toBe('access-9');
      expect(envelope?.['refreshToken']).toBe('refresh-9');
    });

    it('écrit une enveloppe à la forme attendue', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-10', 'refresh-10');
      service.setTenantId('tenant-10');

      const envelope = local.bundle();
      expect(envelope).not.toBeNull();
      expect(Object.keys(envelope as Record<string, unknown>).sort()).toEqual([
        'accessToken',
        'refreshToken',
        'remember',
        'tenantId',
      ]);
      expect(envelope?.['accessToken']).toBe('access-10');
      expect(envelope?.['refreshToken']).toBe('refresh-10');
      expect(envelope?.['tenantId']).toBe('tenant-10');
      expect(typeof envelope?.['remember']).toBe('boolean');
    });

    it('les lectures ne créent aucune entrée de stockage', () => {
      const service = new TokenService();

      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeFalse();

      expect(local.keys()).toEqual([]);
      expect(session.keys()).toEqual([]);
    });

    it('traite une chaîne vide ou null comme une absence de valeur', () => {
      const service = new TokenService();

      service.setTokens('', '');
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.hasTokens()).toBeFalse();

      service.setTokens('access-11', 'refresh-11');
      service.setAccessToken('');
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBe('refresh-11');
      expect(service.hasTokens()).toBeFalse();

      service.setRefreshToken('');
      expect(service.getRefreshToken()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
    });

    it('gère le tenantId de bout en bout, indépendamment des tokens', () => {
      const service = new TokenService();
      expect(service.getTenantId()).toBeNull();

      service.setTenantId('tenant-12');
      expect(service.getTenantId()).toBe('tenant-12');

      service.setTenantId('');
      expect(service.getTenantId()).toBeNull();

      service.setTenantId('tenant-13');
      service.clearTenantId();
      expect(service.getTenantId()).toBeNull();

      // Le tenant n'entre pas dans le calcul de hasTokens().
      service.setTokens('access-12', 'refresh-12');
      service.setTenantId(null);
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeTrue();
      expect(reload().getTenantId()).toBeNull();
    });

    it('permet de retirer un seul token sans purger l\'autre', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-13', 'refresh-13');

      service.removeAccessToken();
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBe('refresh-13');
      expect(service.hasTokens()).toBeFalse();

      service.removeRefreshToken();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
    });
  });

  // -------------------------------------------------------------------------
  describe("Régression : deux onglets, session d'onglet isolée", () => {
    it('ne perd pas la session d\'un onglet quand un autre onglet se connecte', () => {
      // localStorage est partagé par tous les onglets, sessionStorage non :
      // on materialise cette différence par un même `local` et deux `session`.
      const tab1Session = new FakeStorage();
      const tab2Session = new FakeStorage();

      // --- Onglet 1 : session limitée à l'onglet.
      useStorage('localStorage', local);
      useStorage('sessionStorage', tab1Session);
      const tab1 = new TokenService();
      tab1.setRemember(false);
      tab1.setTokens('tab1-access', 'tab1-refresh');
      tab1.setTenantId('tenant-tab1');
      expect(tab1Session.keys()).toEqual([BUNDLE_KEY]);
      expect(local.keys()).toEqual([]);

      // --- Onglet 2 : même localStorage, sessionStorage distinct, persistant.
      useStorage('sessionStorage', tab2Session);
      const tab2 = new TokenService();
      tab2.setRemember(true);
      tab2.setTokens('tab2-access', 'tab2-refresh');
      tab2.setTenantId('tenant-tab2');
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(tab2Session.keys()).toEqual([]);

      // --- Retour dans l'onglet 1 : sa session doit être intacte.
      useStorage('sessionStorage', tab1Session);
      const tab1After = reload();
      expect(tab1After.getAccessToken()).toBe('tab1-access');
      expect(tab1After.getRefreshToken()).toBe('tab1-refresh');
      expect(tab1After.getTenantId()).toBe('tenant-tab1');
      expect(tab1After.hasTokens()).toBeTrue();

      // --- L'onglet 2 est toujours connecté de son côté.
      useStorage('sessionStorage', tab2Session);
      const tab2After = reload();
      expect(tab2After.getAccessToken()).toBe('tab2-access');
      expect(tab2After.getRefreshToken()).toBe('tab2-refresh');
      expect(tab2After.getTenantId()).toBe('tenant-tab2');
      expect(tab2After.hasTokens()).toBeTrue();

      // Chaque onglet conserve exactement une enveloppe, dans le bon stockage.
      expect(tab1Session.keys()).toEqual([BUNDLE_KEY]);
      expect(tab2Session.keys()).toEqual([]);
      expect(local.keys()).toEqual([BUNDLE_KEY]);
    });

    it('isole deux sessions d\'onglet concurrentes, y compris pour le tenant', () => {
      const tab1Session = new FakeStorage();
      const tab2Session = new FakeStorage();

      useStorage('sessionStorage', tab1Session);
      const tab1 = new TokenService();
      tab1.setRemember(false);
      tab1.setTokens('a1', 'r1');
      tab1.setTenantId('t1');

      useStorage('sessionStorage', tab2Session);
      const tab2 = new TokenService();
      tab2.setRemember(false);
      tab2.setTokens('a2', 'r2');
      tab2.setTenantId('t2');

      useStorage('sessionStorage', tab1Session);
      expect(reload().getTenantId()).toBe('t1');
      expect(reload().getAccessToken()).toBe('a1');

      useStorage('sessionStorage', tab2Session);
      expect(reload().getTenantId()).toBe('t2');
      expect(reload().getAccessToken()).toBe('a2');

      // Aucune des deux sessions n'a fui dans le localStorage partagé.
      expect(local.keys()).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  describe("Marqueur hérité `transci_remember`", () => {
    it('ignore un marqueur `transci_remember = true` bricolé dans localStorage', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-14', 'refresh-14');

      // Simulation d'un onglet resté sur l'ancienne version du service, qui
      // écrit le marqueur global « se souvenir ». Il est planté APRÈS
      // l'instanciation, car la migration le purge au démarrage.
      local.setItem('transci_remember', 'true');

      // L'emplacement est déduit de l'enveloppe, pas du marqueur : la session
      // d'onglet reste lisible.
      expect(service.getAccessToken()).toBe('access-14');
      expect(service.getRefreshToken()).toBe('refresh-14');
      expect(service.hasTokens()).toBeTrue();
      expect(session.peek(BUNDLE_KEY)).not.toBeNull();
    });

    it('ignore un marqueur `transci_remember = false` bricolé dans localStorage', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-15', 'refresh-15');
      expect(local.peek(BUNDLE_KEY)).not.toBeNull();

      local.setItem('transci_remember', 'false');

      // Symétrique : la session persistante survit à un marqueur « session ».
      expect(service.getAccessToken()).toBe('access-15');
      expect(service.getRefreshToken()).toBe('refresh-15');
      expect(service.hasTokens()).toBeTrue();
    });
  });

  // -------------------------------------------------------------------------
  describe('Robustesse face aux pannes de stockage', () => {
    it('ne lève rien et lit null quand l\'écriture échoue (QuotaExceededError)', () => {
      const service = new TokenService();
      local.writeError = quotaError();
      session.writeError = quotaError();

      expect(() => service.setRemember(false)).not.toThrow();
      expect(() => service.setTokens('access-16', 'refresh-16')).not.toThrow();
      expect(() => service.setTenantId('tenant-16')).not.toThrow();

      local.writeError = null;
      session.writeError = null;

      // La connexion n'échoue jamais : seule la persistance est perdue.
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
      expect(local.keys()).toEqual([]);
      expect(session.keys()).toEqual([]);
    });

    it('préserve l\'enveloppe précédente quand une écriture est interrompue', () => {
      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-17', 'refresh-17');

      local.writeError = quotaError();
      expect(() => service.setAccessToken('access-18')).not.toThrow();
      local.writeError = null;

      // Une écriture avortée ne doit ni vider ni dégrader l'état antérieur.
      expect(service.getAccessToken()).toBe('access-17');
      expect(service.getRefreshToken()).toBe('refresh-17');
      expect(service.hasTokens()).toBeTrue();

      const envelope = local.bundle();
      expect(envelope?.['accessToken']).toBe('access-17');
      expect(envelope?.['refreshToken']).toBe('refresh-17');
    });

    it('ne lève rien si l\'accès au stockage est refusé (SecurityError)', () => {
      const error = securityError();
      denyStorage('localStorage', error);
      denyStorage('sessionStorage', error);

      let service!: TokenService;
      expect(() => {
        service = new TokenService();
      }).not.toThrow();
      expect(() => service.setRemember(true)).not.toThrow();
      expect(() => service.setTokens('access-19', 'refresh-19')).not.toThrow();
      expect(() => service.setTenantId('tenant-19')).not.toThrow();
      expect(() => service.clearTokens()).not.toThrow();

      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
    });

    it('rebascule sur localStorage si sessionStorage est inaccessible (remember = false)', () => {
      denyStorage('sessionStorage', securityError());

      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-20', 'refresh-20');
      service.setTenantId('tenant-20');

      // Repli plutôt que perte de session.
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(service.getAccessToken()).toBe('access-20');
      expect(service.getRefreshToken()).toBe('refresh-20');
      expect(service.getTenantId()).toBe('tenant-20');
      expect(service.hasTokens()).toBeTrue();

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-20');
      expect(reloaded.getRefreshToken()).toBe('refresh-20');
      expect(reloaded.getTenantId()).toBe('tenant-20');
    });

    it('rebascule sur sessionStorage si localStorage est inaccessible (remember = true)', () => {
      denyStorage('localStorage', securityError());

      const service = new TokenService();
      service.setRemember(true);
      service.setTokens('access-21', 'refresh-21');
      service.setTenantId('tenant-21');

      expect(session.keys()).toEqual([BUNDLE_KEY]);
      expect(service.getAccessToken()).toBe('access-21');
      expect(service.getRefreshToken()).toBe('refresh-21');
      expect(service.getTenantId()).toBe('tenant-21');
      expect(reload().getAccessToken()).toBe('access-21');
    });

    it('ne lève rien quand la lecture du stockage échoue (SecurityError)', () => {
      const service = new TokenService();
      service.setTokens('access-22', 'refresh-22');

      // Erreur tardive, au moment de lire seulement.
      local.readError = securityError();
      session.readError = securityError();
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
      local.readError = null;
      session.readError = null;

      // L'état était intact : il redevient lisible dès le stockage rétabli.
      expect(service.getAccessToken()).toBe('access-22');
      expect(service.getRefreshToken()).toBe('refresh-22');
    });
  });

  // -------------------------------------------------------------------------
  describe('Enveloppe corrompue', () => {
    const MAUVAISES_FORMES: ReadonlyArray<{ libelle: string; raw: string }> = [
      { libelle: 'du JSON invalide', raw: '{ceci nest pas du json' },
      { libelle: 'la chaîne « null »', raw: 'null' },
      { libelle: 'un nombre', raw: '42' },
      { libelle: 'une chaîne nue', raw: '"transci"' },
      { libelle: 'un tableau', raw: '["access-token"]' },
      { libelle: 'un objet vide', raw: '{}' },
      { libelle: 'des tokens non textuels', raw: '{"accessToken":42,"refreshToken":true,"tenantId":[],"remember":"non"}' },
      { libelle: 'des tokens vides', raw: '{"accessToken":"","refreshToken":"","tenantId":""}' },
      { libelle: 'une chaîne vide', raw: '' },
    ];

    for (const { libelle, raw } of MAUVAISES_FORMES) {
      it(`renvoie null sans exception pour une enveloppe ${libelle}`, () => {
        local.setItem(BUNDLE_KEY, raw);
        session.setItem(BUNDLE_KEY, raw);

        const service = new TokenService();
        expect(service.getAccessToken()).toBeNull();
        expect(service.getRefreshToken()).toBeNull();
        expect(service.getTenantId()).toBeNull();
        expect(service.hasTokens()).toBeFalse();
        expect(() => service.clearTokens()).not.toThrow();
      });
    }

    it('ignore une enveloppe corrompue et lit l\'enveloppe valide de l\'autre stockage', () => {
      local.setItem(BUNDLE_KEY, '{enveloppe corrompue');
      session.setItem(
        BUNDLE_KEY,
        JSON.stringify({
          accessToken: 'access-23',
          refreshToken: 'refresh-23',
          tenantId: 'tenant-23',
          remember: false,
        }),
      );

      const service = new TokenService();
      expect(service.getAccessToken()).toBe('access-23');
      expect(service.getRefreshToken()).toBe('refresh-23');
      expect(service.getTenantId()).toBe('tenant-23');
      expect(service.hasTokens()).toBeTrue();
    });

    it('répare une enveloppe corrompue à la prochaine écriture', () => {
      local.setItem(BUNDLE_KEY, '{enveloppe corrompue');

      const service = new TokenService();
      expect(service.hasTokens()).toBeFalse();

      expect(() => service.setTokens('access-24', 'refresh-24')).not.toThrow();
      expect(service.getAccessToken()).toBe('access-24');
      expect(service.getRefreshToken()).toBe('refresh-24');
      expect(service.hasTokens()).toBeTrue();
      expect(local.bundle()?.['accessToken']).toBe('access-24');
    });
  });

  // -------------------------------------------------------------------------
  describe('Migration des clés héritées', () => {
    it('purge les quatre clés héritées dans les deux stockages à l\'instanciation', () => {
      for (const key of LEGACY_KEYS) {
        local.setItem(key, 'valeur-heritee');
        session.setItem(key, 'valeur-heritee');
      }

      const service = new TokenService();

      for (const key of LEGACY_KEYS) {
        expect(local.peek(key)).withContext(`localStorage/${key}`).toBeNull();
        expect(session.peek(key)).withContext(`sessionStorage/${key}`).toBeNull();
      }
      expect(local.keys()).toEqual([]);
      expect(session.keys()).toEqual([]);

      // Aucun jeton hérité n'est réadopté.
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getTenantId()).toBeNull();
      expect(service.hasTokens()).toBeFalse();
    });

    it('ne purge pas les clés hors périmètre de la migration', () => {
      local.setItem('transci_autre_cle', 'conservee');
      session.setItem('transci_autre_cle', 'conservee-onglet');

      new TokenService();

      expect(local.peek('transci_autre_cle')).toBe('conservee');
      expect(session.peek('transci_autre_cle')).toBe('conservee-onglet');
    });

    it('ne détruit pas une session valide lors de la purge des clés héritées', () => {
      const service = new TokenService();
      service.setTokens('access-25', 'refresh-25');
      service.setTenantId('tenant-25');

      // Simule des clés héritées laissées par une version antérieure,
      // présentes au moment du « rechargement ».
      local.setItem('transci_access_token', 'ancien-access');
      local.setItem('transci_refresh_token', 'ancien-refresh');
      local.setItem('transci_remember', 'true');

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-25');
      expect(reloaded.getRefreshToken()).toBe('refresh-25');
      expect(reloaded.getTenantId()).toBe('tenant-25');
      expect(reloaded.hasTokens()).toBeTrue();
      expect(local.peek('transci_access_token')).toBeNull();
      expect(local.peek('transci_refresh_token')).toBeNull();
      expect(local.peek('transci_remember')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  describe("Unicité de l'enveloppe", () => {
    it('ne laisse qu\'une seule copie, dans le stockage choisi', () => {
      const service = new TokenService();

      service.setRemember(false);
      service.setTokens('access-26', 'refresh-26');
      expect(envelopeCopies(local, session)).toBe(1);
      expect(session.keys()).toEqual([BUNDLE_KEY]);
      expect(local.keys()).toEqual([]);

      // Bascule de durée de vie : l'ancienne copie disparaît, pas de doublon.
      service.setRemember(true);
      service.setTokens('access-27', 'refresh-27');
      expect(envelopeCopies(local, session)).toBe(1);
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(session.keys()).toEqual([]);

      const envelope = local.bundle();
      expect(envelope?.['accessToken']).toBe('access-27');
      expect(envelope?.['refreshToken']).toBe('refresh-27');
      expect(reload().getAccessToken()).toBe('access-27');
    });

    it('n\'accumule pas de copie orpheline dans l\'autre stockage', () => {
      // Enveloppe tronquée, laissée par une écriture interrompue sur une
      // version antérieure : illisible, donc « non trouvée », mais toujours
      // présente sur le disque.
      session.setItem(BUNDLE_KEY, '{"accessToken":"access-tronque');

      const service = new TokenService();
      // Préférence neutre => le stockage par défaut (localStorage) est visé,
      // alors qu'une entrée subsiste dans sessionStorage.
      service.setTokens('access-29', 'refresh-29');

      // L'entrée illisible doit être purgée : une seule enveloppe, jamais deux.
      expect(envelopeCopies(local, session)).toBe(1);
      expect(local.keys()).toEqual([BUNDLE_KEY]);
      expect(session.keys()).toEqual([]);
      expect(service.getAccessToken()).toBe('access-29');
      expect(service.getRefreshToken()).toBe('refresh-29');

      const reloaded = reload();
      expect(reloaded.getAccessToken()).toBe('access-29');
      expect(reloaded.getRefreshToken()).toBe('refresh-29');
    });

    it('n\'écrit que la clé de l\'enveloppe, rien d\'autre', () => {
      const service = new TokenService();
      service.setRemember(false);
      service.setTokens('access-28', 'refresh-28');
      service.setTenantId('tenant-28');

      expect(session.keys()).toEqual([BUNDLE_KEY]);
      expect(local.keys()).toEqual([]);

      const bundle = session.bundle();
      expect(bundle?.['accessToken']).toBe('access-28');
      expect(bundle?.['refreshToken']).toBe('refresh-28');
      expect(bundle?.['tenantId']).toBe('tenant-28');
    });
  });
});
