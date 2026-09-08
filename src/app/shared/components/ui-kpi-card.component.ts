import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-kpi-card',
  standalone: true,
  template: `
    <div class="card kpi-card h-100">
      <div class="card-body">
        <div class="kpi-icon" [class]="iconClass">
          <i [class]="'bi ' + icon"></i>
        </div>
        <div class="flex-grow-1">
          <div class="kpi-value">{{ value }}</div>
          <div class="kpi-label">{{ label }}</div>
        </div>
      </div>
    </div>
  `,
})
export class UiKpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'bi-grid';
  @Input() iconClass = 'bg-primary-subtle text-primary';
}