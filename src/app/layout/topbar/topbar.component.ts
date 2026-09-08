import { InactivityService } from '@/app/partager/inactivity.service'
import { LocalStorageService } from '@/app/partager/local.service'
import { changetheme } from '@/store/layout/layout-action'
import { getLayoutColor } from '@/store/layout/layout-selector'
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  inject,
  type OnDestroy,
  type OnInit,
  Output,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router, NavigationEnd } from '@angular/router'
import { AuthService } from '@core/auth/services/auth.service'
import { FuncService } from '@/app/partager/glefunctions'
import { TimeThemeService } from '@core/services/time-theme.service'
import { NgbDropdownModule, NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store'
import { Subscription } from 'rxjs'
import { MENU_ITEMS } from '@common/menu-meta'

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, NgbOffcanvasModule, NgbDropdownModule, FormsModule],
  templateUrl: './topbar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``,
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() settingsButtonClicked = new EventEmitter<void>()
  @Output() mobileMenuButtonClicked = new EventEmitter<void>()

  readonly user = inject(AuthService).user
  readonly authService = inject(AuthService)
  readonly router = inject(Router)
  protected readonly func = inject(FuncService)
  private readonly localStorageService = inject(LocalStorageService)
  private readonly store = inject(Store)
  private readonly timeThemeService = inject(TimeThemeService)
  readonly inactivityService = inject(InactivityService)

  layoutTheme = 'light'
  showInactivityTime = true
  pageTitle = 'Tableau de bord'
  pageCaption = ''
  searchQuery = ''

  private inactivitySub!: Subscription
  private themeSub!: Subscription
  private routerSub!: Subscription

  constructor() {
    this.themeSub = this.store.select(getLayoutColor).subscribe((color) => {
      this.layoutTheme = color
      document.documentElement.setAttribute('data-bs-theme', color)
    })
    this.inactivitySub = this.inactivityService
      .getInactivityObservable()
      .subscribe(() => {
        this.showInactivityTime = false
      })
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updatePageTitle()
      }
    })
    this.reinitTheme()
  }

  ngOnInit(): void {
    const current = document.documentElement.getAttribute('data-bs-theme')
    if (current) {
      this.layoutTheme = current
    }
  }

  ngOnDestroy(): void {
    this.inactivitySub?.unsubscribe()
    this.themeSub?.unsubscribe()
    this.routerSub?.unsubscribe()
  }

  /** Met à jour le titre/caption de la topbar depuis le menu actif. */
  private updatePageTitle(): void {
    const url = this.router.url.split('?')[0].split('#')[0]
    let found = false
    for (const menu of MENU_ITEMS) {
      if (menu.isTitle) continue
      if (menu.url && url === menu.url) {
        this.pageTitle = menu.label
        this.pageCaption = 'Vue d\'ensemble'
        found = true
        break
      }
      const child = menu.children?.find(
        (c) => c.url && (url === c.url || url.startsWith(c.url + '/'))
      )
      if (child) {
        this.pageTitle = child.label
        this.pageCaption = menu.label
        found = true
        break
      }
    }
    if (!found) {
      const crumbs = url.split('/').filter(Boolean)
      this.pageTitle = crumbs.length ? crumbs[crumbs.length - 1] : 'Accueil'
      this.pageCaption = ''
    }
  }

  /** Recherche globale : si la saisie correspond à un libellé ou slug du menu, on navigue. */
  onGlobalSearch(): void {
    const q = this.searchQuery.trim().toLowerCase()
    if (!q) return
    const flat: { label: string; url: string; section: string }[] = []
    for (const menu of MENU_ITEMS) {
      if (menu.isTitle) continue
      if (menu.url) flat.push({ label: menu.label, url: menu.url, section: '' })
      for (const c of menu.children ?? []) {
        if (c.url) flat.push({ label: c.label, url: c.url, section: menu.label })
      }
    }
    const match =
      flat.find((f) => f.label.toLowerCase() === q) ??
      flat.find((f) => f.label.toLowerCase().includes(q) || q.includes(f.label.toLowerCase()))
    if (match) {
      this.router.navigate([match.url]).then(() => {
        this.searchQuery = ''
      })
    }
  }

  getFormattedTimeRemaining(): string {
    return this.inactivityService.getFormattedTimeRemaining()
  }

  settingMenu(): void {
    this.settingsButtonClicked.emit()
  }

  toggleMobileMenu(): void {
    this.mobileMenuButtonClicked.emit()
  }

  changeTheme(): void {
    const next = this.layoutTheme === 'light' ? 'dark' : 'light'
    this.store.dispatch(changetheme({ color: next }))
    this.localStorageService.setJsonValue('theme', next)
  }

  reinitTheme(): void {
    const saved = this.localStorageService.getJsonValue('theme') as string | null
    const color = saved === 'dark' ? 'dark' : 'light'
    this.store.dispatch(changetheme({ color }))
    this.layoutTheme = color
    document.documentElement.setAttribute('data-bs-theme', color)
  }

  logout(): void {
    this.authService.logout()
  }

  getDisplayName(): string {
    const u = this.user()
    return (u?.prenom || u?.nom || u?.email || 'Utilisateur').trim()
  }

  getInitials(): string {
    const u = this.user()
    return this.func.getInitials(`${u?.prenom ?? ''} ${u?.nom ?? ''}`) || 'U'
  }

  toggleAutoTheme(): void {
    this.timeThemeService.toggleAutoTheme()
  }

  isAutoThemeEnabled(): boolean {
    return this.timeThemeService.isAutoThemeEnabled()
  }

  getNextThemeSwitchTime(): string {
    return this.timeThemeService.getNextThemeSwitchTime()
  }

  getTimeUntilNextSwitch(): string {
    return this.timeThemeService.getTimeUntilNextSwitch()
  }
}