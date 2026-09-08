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
- `src/app/features/` — pages : auth (login, forbidden), dashboard, administration (utilisateurs, roles, permissions)
- `src/app/core/` — services, guards, interceptors, auth (signaux user/permissions depuis le JWT)
- `src/app/common/` — menu (menu-meta), constantes de permissions
- `src/app/partager/` — utilitaires (storage, toasts, fonctions, gestion d'inactivité)
- `src/store/` — store de layout (@ngrx/signals)
- `src/styles.scss` + `public/assets/scss/appdashboard.scss` — thème AppDashboard (Bootstrap compilé + tokens)

## Conventions

- Composants standalone, TypeScript strict, pas de `any` sauf nécessité justifiée.
- Les règles métier vivent dans le backend (NestJS) ; le front n'affiche et ne valide qu'en soutien.
- Modales via `NgbModal`, confirmations via `ConfirmService`, notifications via `ToastrCustomService`.
- Icônes Bootstrap Icons (`bi-*`), marque TransCI (logo `assets/images/logotoggle.png`).
- La documentation technique (migrations) est dans `docs/RAPPORT_SHELL_HIGHDMIN.md` et `docs/RAPPORT_REFONTE_APPDASHBOARD.md`.