import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-auth-logo',
  standalone: true,
  imports: [RouterLink],
  template: `<a routerLink="/login" class="auth-brand mb-4 d-inline-block">
    <img
      src="assets/images/logotoggle.png"
      alt="TransCI"
      height="56"
      class="logo-dark"
      style="object-fit: contain"
    />
    <img
      src="assets/images/logotoggle.png"
      alt="TransCI"
      height="56"
      class="logo-light"
      style="object-fit: contain"
    />
  </a>`,
})
export class AuthLogoComponent {}