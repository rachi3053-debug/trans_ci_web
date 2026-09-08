import { Component, Input, computed, signal } from '@angular/core';

export type StatusTone = 'success' | 'danger' | 'info' | 'warning';

function mapStatus(value: string | boolean | number | null | undefined): StatusTone | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, '_');
  if (['actif', 'active', 'true', '1', 'yes', 'oui'].includes(normalized)) {
    return 'success';
  }
  if (['inactif', 'inactive', 'false', '0', 'no', 'non'].includes(normalized)) {
    return 'danger';
  }
  if (['en_attente', 'warning', 'pending', 'attente'].includes(normalized)) {
    return 'warning';
  }
  if (['en_cours', 'info'].includes(normalized)) {
    return 'info';
  }
  return null;
}

@Component({
  selector: 'app-ui-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="'status-' + effectiveTone()">{{ label }}</span>`,
})
export class UiStatusBadgeComponent {
  @Input() label = '';
  @Input() set tone(value: StatusTone) {
    this.toneSignal.set(value);
  }
  @Input() set status(value: string | boolean | number | null | undefined) {
    this.statusSignal.set(value ?? null);
  }

  private readonly toneSignal = signal<StatusTone>('info');
  private readonly statusSignal = signal<string | boolean | number | null>(null);

  readonly effectiveTone = computed<StatusTone>(() => {
    return mapStatus(this.statusSignal()) ?? this.toneSignal();
  });
}