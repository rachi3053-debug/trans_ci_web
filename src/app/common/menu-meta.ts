import { environment } from '../../environments/environment'

export type MenuItemType = {
  key: string
  label: string
  /** Si `false`, l'entrée est masquée (menu principal et sous-menus). Par défaut : activé. */
  active?: boolean
  isTitle?: boolean
  icon?: string
  url?: string
  isSettings?: boolean
  permission?: string
  badge?: {
    variant: string
    text: string
  }
  parentKey?: string
  isDisabled?: boolean
  collapsed?: boolean
  children?: MenuItemType[]
}

export type SubMenus = {
  item: MenuItemType
  linkClassName?: string
  subMenuClassName?: string
  activeMenuItems?: Array<string>
  toggleMenu?: (item: MenuItemType, status: boolean) => void
  className?: string
}

function applyMenuActiveFromEnvironment(items: MenuItemType[]): MenuItemType[] {
  const disabled = new Set(environment.disabledMenuKeys ?? [])
  return items.map((item) => {
    const active = item.active !== false && !disabled.has(item.key)
    const children = item.children?.length
      ? applyMenuActiveFromEnvironment(item.children)
      : item.children
    if (active === item.active && children === item.children) {
      return item
    }
    return { ...item, active, children }
  })
}

/**
 * Retire les entrées avec `active: false` (récursif sur `children`),
 * après application de `environment.disabledMenuKeys`.
 */
export function filterMenuItemsByActive(items: MenuItemType[]): MenuItemType[] {
  return applyMenuActiveFromEnvironment(items)
    .filter((item) => item.active !== false)
    .map((item) => {
      const children = item.children?.length
        ? filterMenuItemsByActive(item.children)
        : item.children
      if (children === item.children) {
        return item
      }
      return { ...item, children }
    })
}

/** Modules metiers (pages placeholder : pas encore developpees). */
const METIER_MENU_ITEMS: MenuItemType[] = [
  {
    key: 'tenants',
    label: 'Tenants',
    icon: 'bi-buildings',
    url: '/tenants',
    parentKey: 'modules-metiers',
    permission: 'TENANT:READ',
    active: true,
  },
  {
    key: 'chauffeurs',
    label: 'Chauffeurs',
    icon: 'bi-person-vcard',
    url: '/chauffeurs',
    parentKey: 'modules-metiers',
    permission: 'CHAUFFEUR:READ',
    active: true,
  },
  {
    key: 'vehicules',
    label: 'Véhicules',
    icon: 'bi-truck',
    url: '/vehicules',
    parentKey: 'modules-metiers',
    permission: 'VEHICULE:READ',
    active: true,
  },
  {
    key: 'gares',
    label: 'Gares',
    icon: 'bi-signpost-split',
    url: '/gares',
    parentKey: 'modules-metiers',
    permission: 'GARE:READ',
    active: true,
  },
  {
    key: 'trajets',
    label: 'Trajets',
    icon: 'bi-signpost-2',
    url: '/trajets',
    parentKey: 'modules-metiers',
    permission: 'TRAJET:READ',
    active: true,
  },
  {
    key: 'departs',
    label: 'Départs',
    icon: 'bi-rocket-takeoff',
    url: '/departs',
    parentKey: 'modules-metiers',
    permission: 'DEPART:READ',
    active: true,
  },
  {
    key: 'colis',
    label: 'Colis',
    icon: 'bi-box-seam',
    url: '/colis',
    parentKey: 'modules-metiers',
    permission: 'COLIS:READ',
    active: true,
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: 'bi-cash-coin',
    url: '/finance',
    parentKey: 'modules-metiers',
    permission: 'FINANCE:READ',
    active: true,
  },
  {
    key: 'parametres',
    label: 'Paramètres',
    icon: 'bi-sliders',
    url: '/parametres',
    parentKey: 'modules-metiers',
    permission: 'PARAMETRE:READ',
    active: true,
  },
]

/** Menu principal TransCI : Tableau de bord + Administration + Modules metiers. */
export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'nav-heading',
    label: 'Navigation',
    isTitle: true,
    active: true,
  },
  {
    key: 'dashboard',
    label: 'Tableau de bord',
    icon: 'bi-grid',
    url: '/dashboard',
    active: true,
  },
  {
    key: 'administration-heading',
    label: 'Administration',
    isTitle: true,
    active: true,
  },
  {
    key: 'administration',
    label: 'Administration',
    icon: 'bi-gear',
    active: true,
    children: [
      {
        key: 'utilisateurs',
        label: 'Utilisateurs',
        icon: 'bi-people',
        url: '/administration/utilisateurs',
        parentKey: 'administration',
        permission: 'USER:READ',
        active: true,
      },
      {
        key: 'roles',
        label: 'Rôles',
        icon: 'bi-person-badge',
        url: '/administration/roles',
        parentKey: 'administration',
        permission: 'ROLE:READ',
        active: true,
      },
      {
        key: 'permissions',
        label: 'Permissions',
        icon: 'bi-shield-lock',
        url: '/administration/permissions',
        parentKey: 'administration',
        permission: 'PERMISSION:READ',
        active: true,
      },
    ],
  },
  {
    key: 'metiers-heading',
    label: 'Modules métiers',
    isTitle: true,
    active: true,
  },
  {
    key: 'modules-metiers',
    label: 'Modules métiers',
    icon: 'bi-grid-3x3-gap',
    active: true,
    children: METIER_MENU_ITEMS,
  },
]

export const MODULES_MAIN_MENU_ITEMS: MenuItemType[] = MENU_ITEMS
export const HORIZONTAL_MENU_ITEM: MenuItemType[] = MENU_ITEMS