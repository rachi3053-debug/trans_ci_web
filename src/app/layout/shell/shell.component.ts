import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HealthApiService } from '../../core/services/health-api.service';
import { MenuItemComponent } from '../../common/menu/menu-items.component';
import { filterMenuItemsByActive, MODULES_MAIN_MENU_ITEMS } from '../../common/menu/menu';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MenuItemComponent,
   
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  private readonly healthApi = inject(HealthApiService);

  readonly apiStatus = signal<'unknown' | 'ok' | 'down'>('unknown');
  readonly sidenavOpened = signal(true);

  visibleMenuItems = computed(() => filterMenuItemsByActive(MODULES_MAIN_MENU_ITEMS));
  ngOnInit(): void {
    this.healthApi.getStatus().subscribe({
      next: () => this.apiStatus.set('ok'),
      error: () => this.apiStatus.set('down'),
    });
  }
}
