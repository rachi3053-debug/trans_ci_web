import { environment } from "../../../environments/environment"


export type MenuItemType = {
  key: string
  label: string
  /** Si `false`, l'entrée est masquée (menu principal, sous-menus et `children`). Par défaut : activé. */
  active?: boolean
  isTitle?: boolean
  icon?: string
  url?: string
  permission?: string
  parentKey?: string
  children?: MenuItemType[]
}

function buildEnvDisabledKeysSet(): Set<string> {
  const keys = environment.disabledMenuKeys
  if (!keys?.length) {
    return new Set()
  }
  return new Set(keys)
}

/**
 * Pose explicitement `active` sur chaque entrée : `false` si `key` ∈ `environment.disabledMenuKeys`,
 * sinon conserve le flag du menu (`active !== false` → considéré comme true).
 * Récursif sur `children` ; ne mute pas les tableaux d'origine.
 */
function applyMenuActiveFromEnvironment(items: MenuItemType[]): MenuItemType[] {
  return applyMenuActiveFromEnvironmentCore(items, buildEnvDisabledKeysSet())
}

function applyMenuActiveFromEnvironmentCore(
  items: MenuItemType[],
  envDisabled: Set<string>
): MenuItemType[] {
  return items.map((item) => {
    const fromMenu = item.active !== false
    const active = fromMenu && !envDisabled.has(item.key)
    const children = item.children?.length
      ? applyMenuActiveFromEnvironmentCore(item.children, envDisabled)
      : item.children
    if (active === item.active && children === item.children) {
      return item
    }
    return { ...item, active, children }
  })
}

/**
 * Applique `environment.disabledMenuKeys` puis retire les entrées avec `active: false`
 * (récursif sur `children`).
 */
export function filterMenuItemsByActive(items: MenuItemType[]): MenuItemType[] {
  return filterMenuItemsByActiveCore(applyMenuActiveFromEnvironment(items))
}

function filterMenuItemsByActiveCore(items: MenuItemType[]): MenuItemType[] {
  return items
    .filter((item) => item.active !== false)
    .map((item) => {
      const children = item.children?.length
        ? filterMenuItemsByActiveCore(item.children)
        : item.children
      if (children === item.children) {
        return item
      }
      return { ...item, children }
    })
}

/* --------------------------------------------------------------------------
   Module Exploitation — lignes, voyages, réservations
   -------------------------------------------------------------------------- */
export const EXPLOITATION_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'lignes', label: 'Lignes', icon: 'alt_route', url: '/exploitation/lignes', parentKey: 'exploitation', permission: 'lignes_view', active: true },
  { key: 'voyages', label: 'Voyages', icon: 'directions_bus', url: '/exploitation/voyages', parentKey: 'exploitation', permission: 'voyages_view', active: true },
  { key: 'reservations', label: 'Réservations', icon: 'confirmation_number', url: '/exploitation/reservations', parentKey: 'exploitation', permission: 'reservations_view', active: true },
  { key: 'embarquements', label: 'Embarquements', icon: 'how_to_reg', url: '/exploitation/embarquements', parentKey: 'exploitation', permission: 'embarquements_view', active: true },
]

/* --------------------------------------------------------------------------
   Module Flotte — véhicules, chauffeurs, maintenance
   -------------------------------------------------------------------------- */
export const FLOTTE_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'vehicules', label: 'Véhicules', icon: 'local_shipping', url: '/flotte/vehicules', parentKey: 'flotte', permission: 'vehicules_view', active: true },
  { key: 'chauffeurs', label: 'Chauffeurs', icon: 'badge', url: '/flotte/chauffeurs', parentKey: 'flotte', permission: 'chauffeurs_view', active: true },
  { key: 'maintenance', label: 'Maintenance', icon: 'build', url: '/flotte/maintenance', parentKey: 'flotte', permission: 'maintenance_view', active: true },
  {
    key: 'parametres-flotte',
    label: 'Paramètres Flotte',
    icon: 'settings',
    url: '/flotte/parametres',
    parentKey: 'flotte',
    permission: 'flotte_parametres_view',
    active: true,
    children: [
      { key: 'types-vehicule', label: 'Types de véhicule', icon: 'category', url: '/flotte/types-vehicule', parentKey: 'parametres-flotte', permission: 'types-vehicule_view', active: true },
      { key: 'types-panne', label: 'Types de panne', icon: 'report_problem', url: '/flotte/types-panne', parentKey: 'parametres-flotte', permission: 'types-panne_view', active: true },
    ],
  },
]

/* --------------------------------------------------------------------------
   Module RH — employés, absences, paie
   -------------------------------------------------------------------------- */
export const RH_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'employees', label: 'Employés', icon: 'person', url: '/rh/employees', parentKey: 'rh', permission: 'employees_view', active: true },
  { key: 'absences', label: 'Absences', icon: 'event_busy', url: '/rh/absences', parentKey: 'rh', permission: 'absences_view', active: true },
  {
    key: 'salaires',
    label: 'Salaires',
    icon: 'payments',
    url: '/rh/salaires',
    parentKey: 'rh',
    active: true,
    children: [
      { key: 'paie', label: 'Paie', icon: 'account_balance_wallet', url: '/rh/paie', parentKey: 'salaires', active: true },
      { key: 'primes', label: 'Primes', icon: 'military_tech', url: '/rh/primes', parentKey: 'salaires', permission: 'primes_view', active: true },
    ],
  },
]

/* --------------------------------------------------------------------------
   Module Trésorerie
   -------------------------------------------------------------------------- */
export const TRESORERIE_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'caisses', label: 'Caisses', icon: 'point_of_sale', url: '/tresorerie/caisses', parentKey: 'tresorerie', permission: 'caisses_view', active: true },
  { key: 'recettes', label: 'Recettes', icon: 'attach_money', url: '/tresorerie/recettes', parentKey: 'tresorerie', permission: 'recettes_view', active: true },
  { key: 'depenses', label: 'Dépenses', icon: 'money_off', url: '/tresorerie/depenses', parentKey: 'tresorerie', permission: 'depenses_view', active: true },
]

/* --------------------------------------------------------------------------
   Module Rapports
   -------------------------------------------------------------------------- */
export const RAPPORTS_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'rapports-exploitation', label: 'Exploitation', icon: 'insights', url: '/rapports/exploitation', parentKey: 'rapports', permission: 'rapports_view', active: true },
  { key: 'rapports-financiers', label: 'Financiers', icon: 'bar_chart', url: '/rapports/financiers', parentKey: 'rapports', permission: 'rapports_view', active: true },
]

/* --------------------------------------------------------------------------
   Configuration / Paramètres
   -------------------------------------------------------------------------- */
export const CONFIGURATION_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'organizations', label: 'Organisations', icon: 'apartment', url: '/configurations/organizations', parentKey: 'configurations', permission: 'organizations_view', active: true },
  { key: 'sites', label: 'Sites', icon: 'place', url: '/configurations/sites', parentKey: 'configurations', permission: 'sites_view', active: true },
]

export const PARAMETRES_SUB_MENU_ITEMS: MenuItemType[] = [
  { key: 'utilisateurs', label: 'Utilisateurs', icon: 'group', url: '/parametres/utilisateurs', parentKey: 'parametres', permission: 'users_view', active: true },
  { key: 'profils', label: 'Profils', icon: 'admin_panel_settings', url: '/parametres/profils', parentKey: 'parametres', permission: 'profils_view', active: true },
]

/** Back-to-main-menu item shown in sidebar when inside a module */
export const MODULE_MENU_BACK_ITEM: MenuItemType = {
  key: 'menu-back',
  label: 'Retour au menu',
  icon: 'arrow_back',
  url: '/dashboard',
  active: true,
}

const MODULES_SUBMENU_BY_PATH: Record<string, MenuItemType[]> = {
  exploitation: EXPLOITATION_SUB_MENU_ITEMS,
  flotte: FLOTTE_SUB_MENU_ITEMS,
  rh: RH_SUB_MENU_ITEMS,
  tresorerie: TRESORERIE_SUB_MENU_ITEMS,
  rapports: RAPPORTS_SUB_MENU_ITEMS,
  configurations: CONFIGURATION_SUB_MENU_ITEMS,
  parametres: PARAMETRES_SUB_MENU_ITEMS,
}

/** Retourne le sous-menu correspondant à l'URL donnée, ou null si on est sur le menu principal. */
export function getModuleSubMenuForUrl(url: string): MenuItemType[] | null {
  const normalized = url.replace(/^\//, '').split('?')[0].replace(/\/+$/, '')
  const segment = normalized.split('/')[0]
  const items = segment ? MODULES_SUBMENU_BY_PATH[segment] : null
  return items ? [MODULE_MENU_BACK_ITEM, ...filterMenuItemsByActive(items)] : null
}

/** Menu principal du sidebar : un item par module. */
export const MODULES_MAIN_MENU_ITEMS: MenuItemType[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard', url: '/dashboard', active: true },
  { key: 'exploitation', label: 'Exploitation', icon: 'route', url: '/exploitation', permission: 'exploitation_view', active: true },
  { key: 'flotte', label: 'Flotte', icon: 'directions_bus_filled', url: '/flotte', permission: 'flotte_view', active: true },
  { key: 'rh', label: 'RH', icon: 'groups', url: '/rh', permission: 'employees_view', active: true },
  { key: 'tresorerie', label: 'Trésorerie', icon: 'account_balance', url: '/tresorerie', permission: 'tresorerie_view', active: true },
  { key: 'rapports', label: 'Rapports', icon: 'assessment', url: '/rapports', permission: 'rapports_view', active: true },
  { key: 'parametres', label: 'Paramètres', icon: 'settings', url: '/parametres', permission: 'settings_manager', active: true },
  { key: 'configurations', label: 'Configurations', icon: 'tune', url: '/configurations', permission: 'configurations_manager', active: true },
]