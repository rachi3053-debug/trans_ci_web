import { FuncService } from '@/app/partager/glefunctions'
import { changesidebarsize } from '@/store/layout/layout-action'
import { getSidebarsize } from '@/store/layout/layout-selector'
import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { AuthService } from '@core/auth/services/auth.service'
import { findAllParent } from '@core/helper/utils'
import { MenuItemType, MENU_ITEMS } from '@common/menu-meta'
import { LogoBoxComponent } from '@components/logo-box.component'
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store'
import { SimplebarAngularModule } from 'simplebar-angular'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgbCollapseModule,
    SimplebarAngularModule,
    LogoBoxComponent,
  ],
  templateUrl: './sidebar.component.html',
  styles: ``,
})
export class SidebarComponent {
  menuItems: MenuItemType[] = []
  activeMenuItems: string[] = []

  readonly authService = inject(AuthService)
  readonly user = this.authService.user
  readonly router = inject(Router)
  private readonly store = inject(Store)

  trimmedURL = this.normalizeUrlForMatch(this.router.url)

  constructor(
    protected readonly func: FuncService,
  ) {
    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this.trimmedURL = this.normalizeUrlForMatch(this.router.url)
        this.initMenu()
        setTimeout(() => {
          this.scrollToActive()
        }, 200)
      }
    })
  }

  ngOnInit(): void {
    this.initMenu()
  }

  private getFilteredMenu(items: MenuItemType[]): MenuItemType[] {
    return items
      .filter((item) => {
        if (item.children && item.children.length > 0) {
          const children = this.getFilteredMenu(item.children)
          item.children = children
          return children.length > 0
        }
        return (
          !item.permission ||
          item.permission === 'admin' ||
          this.authService.hasPermission(item.permission)
        )
      })
  }

  initMenu(): void {
    const source = MENU_ITEMS.map((item) => ({
      ...item,
      children: item.children ? item.children.map((c) => ({ ...c })) : undefined,
    }))
    this.menuItems = this.getFilteredMenu(source)
    this._activateMenu()
  }

  hasSubmenu(menu: MenuItemType): boolean {
    return !!menu.children && menu.children.length > 0
  }

  scrollToActive(): void {
    const activatedItem = document.querySelector(
      '.side-nav-item.active .side-nav-link'
    )
    if (activatedItem) {
      const simplebarContent = document.querySelector(
        '.sidenav-menu .simplebar-content-wrapper'
      )
      if (simplebarContent) {
        const activatedItemRect = activatedItem.getBoundingClientRect()
        const simplebarContentRect = simplebarContent.getBoundingClientRect()
        const activatedItemOffsetTop =
          activatedItemRect.top + simplebarContent.scrollTop
        const centerOffset =
          activatedItemOffsetTop -
          simplebarContentRect.top -
          simplebarContent.clientHeight / 2 +
          activatedItemRect.height / 2
        this.scrollTo(simplebarContent, centerOffset, 600)
      }
    }
  }

  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2
    if (t < 1) return (c / 2) * t * t + b
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }

  scrollTo(element: Element, to: number, duration: number): void {
    const start = element.scrollTop
    const change = to - start
    const increment = 20
    let currentTime = 0

    const animateScroll = () => {
      currentTime += increment
      const val = this.easeInOutQuad(currentTime, start, change, duration)
      element.scrollTop = val
      if (currentTime < duration) {
        setTimeout(animateScroll, increment)
      }
    }
    animateScroll()
  }

  /** Normalise une URL : slash de tête, sans slash final, sans query/hash. */
  private normalizeUrlForMatch(url: string): string {
    if (!url) return '/'
    const u = url.split('?')[0].split('#')[0].trim()
    const withSlash = u.startsWith('/') ? u : '/' + u
    return withSlash.replace(/\/+$/, '') || '/'
  }

  _activateMenu(): void {
    const currentUrlNorm = this.normalizeUrlForMatch(this.trimmedURL)
    let matchingMenuItem: MenuItemType | null = null

    for (const menu of this.menuItems) {
      const menuUrlNorm = this.normalizeUrlForMatch(menu.url ?? '')
      if (menuUrlNorm && currentUrlNorm === menuUrlNorm) {
        matchingMenuItem = menu
        break
      }
      if (menuUrlNorm && currentUrlNorm.startsWith(menuUrlNorm + '/')) {
        matchingMenuItem = menu
        break
      }
      if (menu.children) {
        for (const child of menu.children) {
          const childUrlNorm = this.normalizeUrlForMatch(child.url ?? '')
          if (
            childUrlNorm &&
            (currentUrlNorm === childUrlNorm ||
              currentUrlNorm.startsWith(childUrlNorm + '/'))
          ) {
            matchingMenuItem = child
            break
          }
        }
        if (matchingMenuItem) break
      }
    }

    if (matchingMenuItem) {
      const matchingObjs = [
        matchingMenuItem.key!,
        ...findAllParent(this.menuItems, matchingMenuItem),
      ]
      this.activeMenuItems = matchingObjs
      this.menuItems.forEach((menu: MenuItemType) => {
        menu.collapsed = !matchingObjs.includes(menu.key!)
      })
    } else {
      this.activeMenuItems = []
      this.menuItems.forEach((menu: MenuItemType) => {
        menu.collapsed = true
      })
    }
  }

  /**
   * Ouvre/ferme un sous-menu, ou navigue vers l'URL de l'entrée.
   */
  toggleMenuItem(menuItem: MenuItemType, collapse?: any): void {
    if (menuItem.url) {
      this.router.navigate([menuItem.url]).then(() => {})
      return
    }
    if (menuItem.children && menuItem.children.length > 0) {
      if (collapse) {
        collapse.toggle()
      }
      if (!menuItem.collapsed) {
        const openMenuItems = [
          menuItem.key!,
          ...findAllParent(this.menuItems, menuItem),
        ]
        this.menuItems.forEach((menu: MenuItemType) => {
          if (!openMenuItems.includes(menu.key!)) {
            menu.collapsed = true
          }
        })
      }
    }
  }

  logout(): void {
    this.authService.logout()
  }

  changeSidebarSize(): void {
    let size = document.documentElement.getAttribute('data-sidenav-size')
    size = size === 'sm-hover' ? 'sm-hover-active' : 'sm-hover'
    this.store.dispatch(changesidebarsize({ size }))
    this.store.select(getSidebarsize).subscribe((newSize) => {
      document.documentElement.setAttribute('data-sidenav-size', newSize)
    })
  }

  getDisplayName(): string {
    const u = this.user()
    return (u?.prenom || u?.nom || 'Utilisateur').trim()
  }

  getInitials(): string {
    const u = this.user()
    return this.func.getInitials(`${u?.prenom ?? ''} ${u?.nom ?? ''}`) || 'U'
  }
}