import { SessionWarningModalComponent } from '@/app/components/session-warning-modal/session-warning-modal.component'
import { InactivityService } from '@/app/partager/inactivity.service'
import { ToastrCustomService } from '@/app/partager/toastr-custom-service'
import { changesidebarsize } from '@/store/layout/layout-action'
import { LayoutState } from '@/store/layout/layout-reducers'
import { getSidebarsize } from '@/store/layout/layout-selector'
import {
  Component,
  HostListener,
  inject,
  type OnDestroy,
  type OnInit,
  Renderer2,
} from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { AuthService } from '@core/auth/services/auth.service'
import { TimeThemeService } from '@core/services/time-theme.service'
import { NgbModal, NgbOffcanvas, NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store'
import { NgxPermissionsService } from 'ngx-permissions'
import { Subscription } from 'rxjs'
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component'
import { SidebarComponent } from '../sidebar/sidebar.component'
import { TopbarComponent } from '../topbar/topbar.component'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    SidebarComponent,
    RouterModule,
    TopbarComponent,
    NgbOffcanvasModule,
  ],
  templateUrl: './main-layout.component.html',
  styles: ``,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  readonly year = new Date().getFullYear()
  private readonly offcanvasService = inject(NgbOffcanvas)
  private readonly store = inject(Store)
  private readonly renderer = inject(Renderer2)
  private readonly modalService = inject(NgbModal)
  private currentModalRef: any = null
  private inactivitySubscription: Subscription = new Subscription()
  private warningSubscription: Subscription = new Subscription()

  constructor(
    private readonly permissionsService: NgxPermissionsService,
    private readonly authService: AuthService,
    private readonly inactivityService: InactivityService,
    private readonly timeThemeService: TimeThemeService,
    private readonly toastrService: ToastrCustomService,
  ) {
    // Permissions ngx-permissions provenant du token (AuthService)
    this.permissionsService.flushPermissions()
    const permissions = this.authService.permissions()
    if (permissions.length > 0) {
      this.permissionsService.loadPermissions(permissions)
    }

    this.inactivityService.startInactivityTimer()

    this.warningSubscription = this.inactivityService
      .getWarningObservable()
      .subscribe(() => {
        this.handleInactivityWarning()
      })

    this.inactivitySubscription = this.inactivityService
      .getInactivityObservable()
      .subscribe(() => {
        this.handleInactivityLogout()
      })
  }

  @HostListener('document:mousemove')
  @HostListener('document:mousedown')
  @HostListener('document:keypress')
  @HostListener('document:keydown')
  @HostListener('document:scroll')
  @HostListener('document:touchstart')
  @HostListener('document:touchmove')
  @HostListener('document:click')
  @HostListener('document:wheel')
  @HostListener('window:focus')
  recordUserActivity(): void {
    this.inactivityService.recordUserActivity()
  }

  ngOnInit(): void {
    this.store.select('layout').subscribe((data: LayoutState) => {
      document.documentElement.setAttribute('data-bs-theme', data.LAYOUT_THEME)
      document.documentElement.setAttribute('data-menu-color', data.MENU_COLOR)
      document.documentElement.setAttribute('data-topbar-color', data.TOPBAR_COLOR)
      document.documentElement.setAttribute('data-sidenav-size', data.MENU_SIZE)
    })

    if (document.documentElement.clientWidth <= 992) {
      this.onResize()
    }

    this.timeThemeService.startAutoThemeSwitching()
  }

  ngOnDestroy(): void {
    this.inactivitySubscription?.unsubscribe()
    this.warningSubscription?.unsubscribe()
    this.inactivityService.stopAllTimers()
    this.timeThemeService.stopAutoThemeSwitching()
  }

  private handleInactivityWarning(): void {
    if (this.currentModalRef) {
      return
    }
    this.currentModalRef = this.modalService.open(SessionWarningModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    })

    this.currentModalRef.result
      .then((stayConnected: boolean) => {
        if (stayConnected) {
          this.toastrService.showSuccessToastr(
            'Votre session a été prolongée',
            'Session active'
          )
        }
        this.currentModalRef = null
      })
      .catch(() => {
        this.currentModalRef = null
      })
  }

  private handleInactivityLogout(): void {
    try {
      if (this.currentModalRef) {
        this.currentModalRef.close()
      }
    } catch {
      // module déjà refermé
    }
    this.currentModalRef = null
    this.modalService.dismissAll()
    this.inactivityService.stopAllTimers()

    this.toastrService.showErrorToastr(
      "Votre session a été fermée pour cause d'inactivité.",
      'Session expirée'
    )

    this.authService.logout()
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.onResize()
  }

  onResize(): void {
    if (
      document.documentElement.clientWidth <= 992 &&
      document.documentElement.clientWidth >= 768
    ) {
      this.store.dispatch(changesidebarsize({ size: 'condensed' }))
    } else if (document.documentElement.clientWidth <= 768) {
      this.store.dispatch(changesidebarsize({ size: 'full' }))
    } else {
      this.store.dispatch(changesidebarsize({ size: 'default' }))
      document.documentElement.classList.remove('sidebar-enable')
      const backdrop = document.querySelector('.offcanvas-backdrop')
      if (backdrop) {
        this.renderer.removeChild(document.body, backdrop)
      }
    }

    this.store.select(getSidebarsize).subscribe((size: string) => {
      this.renderer.setAttribute(
        document.documentElement,
        'data-sidenav-size',
        size
      )
    })
  }

  onSettingsButtonClicked(): void {
    this.offcanvasService.open(RightSidebarComponent, {
      position: 'end',
      backdrop: true,
    })
  }

  onToggleMobileMenu(): void {
    this.store.select(getSidebarsize).subscribe((size: any) => {
      document.documentElement.setAttribute('data-sidenav-size', size)
    })

    const size = document.documentElement.getAttribute('data-sidenav-size')

    document.documentElement.classList.toggle('sidebar-enable')
    if (size !== 'full') {
      if (document.documentElement.classList.contains('sidebar-enable')) {
        this.store.dispatch(changesidebarsize({ size: 'condensed' }))
      } else {
        this.store.dispatch(changesidebarsize({ size: 'default' }))
      }
    } else {
      this.showBackdrop()
    }
  }

  showBackdrop(): void {
    const backdrop = this.renderer.createElement('div')
    this.renderer.addClass(backdrop, 'offcanvas-backdrop')
    this.renderer.addClass(backdrop, 'fade')
    this.renderer.addClass(backdrop, 'show')
    this.renderer.appendChild(document.body, backdrop)
    this.renderer.setStyle(document.body, 'overflow', 'hidden')

    if (window.innerWidth > 1040) {
      this.renderer.setStyle(document.body, 'paddingRight', '15px')
    }

    this.renderer.listen(backdrop, 'click', () => {
      document.documentElement.classList.remove('sidebar-enable')
      this.renderer.removeChild(document.body, backdrop)
      this.renderer.setStyle(document.body, 'overflow', null)
      this.renderer.setStyle(document.body, 'paddingRight', null)
    })
  }
}