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

/** Menu principal TransCI : Tableau de bord + Administration. */
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
]

export const MODULES_MAIN_MENU_ITEMS: MenuItemType[] = MENU_ITEMS
export const HORIZONTAL_MENU_ITEM: MenuItemType[] = MENU_ITEMS