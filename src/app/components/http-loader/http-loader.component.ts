import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpLoaderService } from '@core/services/http-loader.service';

@Component({
  selector: 'app-http-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loader.isLoading()) {
      <div class="http-loader-overlay" role="status" aria-live="polite" aria-busy="true">
        <div class="http-loader-box">
          <div class="bouncing-loader" aria-hidden="true">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p class="http-loader-label">Chargement...</p>
        </div>
      </div>
    }
  `,
  styles: `
    .http-loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 20000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--bs-tertiary-bg, #f8f9fa) 72%, transparent);
      backdrop-filter: blur(2px);
    }

    .http-loader-box {
      min-width: 160px;
      padding: 1.25rem 1.5rem 0.75rem;
      border-radius: 12px;
      background: var(--bs-body-bg, #fff);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
      text-align: center;
    }

    .http-loader-label {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      color: var(--bs-secondary-color, #6c757d);
    }
  `,
})
export class HttpLoaderComponent {
  readonly loader = inject(HttpLoaderService);
}
