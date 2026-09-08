import {
  Component,
  inject,
  Renderer2,
  type OnDestroy,
  type OnInit,
} from '@angular/core'
import { RouterModule } from '@angular/router'
import { currentYear } from '@common/constants'
import { AuthLogoComponent } from '@components/auth-logo.component'

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterModule, AuthLogoComponent],
  template: `
    <div
      class="auth-bg d-flex min-vh-100 justify-content-center align-items-center"
    >
      <div class="row g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <div class="col-xl-4 col-lg-5 col-md-6">
          <div class="card overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <app-auth-logo class="mb-3" />
            <router-outlet></router-outlet>
            <p class="mt-auto mb-0 small text-muted">
              {{ currentYear }} &copy; TransCI
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  currentYear = currentYear
  private renderer = inject(Renderer2)

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'h-100')
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'h-100')
  }
}