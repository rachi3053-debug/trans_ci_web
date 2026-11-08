import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-auth-logo',
  standalone: true,
  imports: [RouterLink],
  template:'./session-warning-modal.component.html/',
})
export class AuthLogoComponent {}
