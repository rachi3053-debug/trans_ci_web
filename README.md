# Web — TransCI

Application web Angular 19 (standalone components), partie de la plateforme TransCI
(gestion d'une compagnie de transport interurbain, Côte d'Ivoire).

## Stack

- Angular 19, TypeScript strict
- Bootstrap 5 + ng-bootstrap (thème « AppDashboard » — langage visuel BootstrapMade, icônes Bootstrap Icons, police Nunito)
- ngx-toastr (notifications), ngx-permissions (droits), @ngrx/signals (store layout),
  simplebar, jwt-decode, dayjs, localstorage-slim
- **Aucun Angular Material** (migration terminée, voir `docs/RAPPORT_SHELL_HIGHDMIN.md`)

## Démarrage

```bash
npm install
npm start        # http://localhost:4200
```

L'API attendue est l'application `apps/api` (NestJS) : http://localhost:3000/api/v1.

## Build

```bash
npm run build    # sortie vers dist/web
```

## Structure

- `src/app/layout/` — coquille (main-layout, sidebar, topbar, right-sidebar, footer, auth-layout, modalconfirm)
- `src/app/features/` — pages : auth (login, forbidden), dashboard, administration (utilisateurs, roles, permissions), modules (placeholders métiers)
- `src/app/core/` — services, guards, interceptors, auth (signaux user/permissions depuis le JWT)
- `src/app/common/` — menu (menu-meta), constantes de permissions
- `src/app/partager/` — utilitaires (storage, toasts, fonctions, gestion d'inactivité)
- `src/store/` — store de layout (@ngrx/signals)
- `src/styles.scss` + `public/assets/scss/appdashboard.scss` — thème AppDashboard (Bootstrap compilé + tokens)

## Multi-tenancy

L'application est conçue sans saisie de tenant au login : le backend (NestJS)
résout le tenant de l'utilisateur normal à partir de son compte
(`tenantId` du profil), le frontend le **stocke** (`TokenService`) puis
l'intercepteur `auth.interceptor.ts` envoie automatiquement le header
`X-Tenant-Id` sur toutes les requêtes.

- **ROOT** : compte global (tenant `null`) → aucun header envoyé, accès à tout. Le statut ROOT est
  lu **exclusivement dans le JWT** (`isRoot === true` ou rôle `ROOT`), jamais déduit de l'absence de
  tenant. `AuthService.isRoot()` / `isRootUser` le reflètent et font bypasser les guards
  (`role`, `permission`), le filtrage du menu (sidebar) et les routes protégées.
- **Utilisateur normal** : ne rien saisir, tout est automatique (les rôles/permissions viennent
  aussi du JWT ; seul le tenant navigue via le header).

Le menu « Modules métiers » (Tenants, Chauffeurs, Véhicules, Gares, Trajets, Départs, Colis, Finance,
Paramètres) est affiché pour le ROOT ; pour les autres utilisateurs il dépend des permissions
(`MODULE:ACTION`, ex. `VEHICULE:READ`). Ces pages sont aujourd'hui des placeholders
(`features/modules/module-placeholder.component.ts`).

## Invitation & activation

- `POST /users` (création) ne saisit plus de mot de passe : une **invitation par
  email** est envoyée à l'utilisateur (`Administration > Utilisateurs`).
- La page publique `features/auth/activation` (`/auth/activate?token=...`) permet
  à l'utilisateur de définir son mot de passe (min. 8 caractères, minuscule,
  majuscule et chiffre requis) puis le redirige vers `/login`.
- Dans la liste des utilisateurs : badge de statut `Invité` (orange), filtre
  « En attente (invité) » et action « Renvoyer l'invitation » pour les comptes
  encore `INVITED` (les actions mot de passe / activation/désactivation sont
  masquées pour ces comptes).
- La page d'activation est mappée à l'URL de `FRONTEND_URL` côté API :
  `http://localhost:4200/auth/activate?token=<jeton>`.

## Mot de passe oublié & réinitialisation

- Depuis la page de connexion, « Mot de passe oublié ? » → `/auth/forgot-password`
  : saisie de l'email, réponse neutre (si un compte existe, un lien est envoyé).
- `/auth/reset-password?token=...` : définit le nouveau mot de passe
  (min. 8 caractères, minuscule, majuscule et chiffre requis) puis redirige
  vers `/login` après purge de session.
- Côté admin : « Mot de passe » dans la liste des utilisateurs (`setup-password`) ;
  `reset-password` est disponible côté API (mot de passe provisoire).

## Conventions

- Composants standalone, TypeScript strict, pas de `any` sauf nécessité justifiée.
- Les listes backend sont paginées (`PaginatedResponseDto`) : `fetchAllPages` (`core/models/paginated.model.ts`)
  en récupère toutes les pages (`limit` plafonné à 100 côté API).
- Les règles métier vivent dans le backend (NestJS) ; le front n'affiche et ne valide qu'en soutien.
- Modales via `NgbModal`, confirmations via `ConfirmService`, notifications via `ToastrCustomService`.
- Icônes Bootstrap Icons (`bi-*`), marque TransCI (logo `assets/images/logotoggle.png`).
- La documentation technique (migrations) est dans `docs/RAPPORT_SHELL_HIGHDMIN.md` et `docs/RAPPORT_REFONTE_APPDASHBOARD.md`.