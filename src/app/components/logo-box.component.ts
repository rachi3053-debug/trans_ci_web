import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo-box',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logo-box.html',
  styles: ``,
})
export class LogoBoxComponent {
  bannerLogoSrc = 'assets/images/logotoggle.png';
  toggleLogoSrc = 'assets/images/logotoggle.png';
}