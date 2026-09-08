import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-empty-state',
  standalone: true,
  template: `
    <div class="appd-empty">
      <i [class]="'bi ' + icon"></i>
      <h5>{{ title }}</h5>
      <p>{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class UiEmptyStateComponent {
  @Input() title = 'Aucune donnée';
  @Input() message = 'Aucun élément à afficher pour le moment.';
  @Input() icon = 'bi-inbox';
}