import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { filter } from 'rxjs';
import { MenuItemType } from './menu';


/**
 * Rend récursivement un MenuItemType :
 * - sans children → un lien mat-list-item
 * - avec children → un mat-expansion-panel qui contient d'autres app-menu-item
 */
@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatExpansionModule],
  template: `
    @if (!item.children?.length) {
      <a
        mat-list-item
        [routerLink]="item.url"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: false }"
      >
        @if (item.icon) {
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
        }
        <span matListItemTitle>{{ item.label }}</span>
      </a>
    } @else {
      <mat-expansion-panel
        class="menu-group"
        [expanded]="hasActiveChild()"
        hideToggle="false"
      >
        <mat-expansion-panel-header>
          <mat-panel-title>
            @if (item.icon) {
              <mat-icon>{{ item.icon }}</mat-icon>
            }
            <span>{{ item.label }}</span>
          </mat-panel-title>
        </mat-expansion-panel-header>

        @for (child of item.children; track child.key) {
          <app-menu-item [item]="child" />
        }
      </mat-expansion-panel>
    }
  `,
  styles: [`
    .menu-group {
      box-shadow: none;
      background: transparent;

      ::ng-deep .mat-expansion-panel-body {
        padding: 0 0 0 16px;
      }
    }

    a.active {
      background-color: rgba(var(--transci-primary-rgb), 0.1);
      color: var(--transci-primary);
      font-weight: 500;
      border-radius: var(--transci-radius-sm);
    }
  `],
})
export class MenuItemComponent {
  @Input({ required: true }) item!: MenuItemType;

  private currentUrl = signal('');

  constructor(private router: Router) {
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));
  }

  /** Vrai si l'URL courante correspond à l'un des descendants — garde le groupe ouvert. */
  hasActiveChild = computed(() => this.containsUrl(this.item, this.currentUrl()));

  private containsUrl(item: MenuItemType, url: string): boolean {
    if (item.url && url.startsWith(item.url)) return true;
    return (item.children ?? []).some((child) => this.containsUrl(child, url));
  }
}