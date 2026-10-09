import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpLoaderService } from '@core/services/http-loader.service';

@Component({
  selector: 'app-http-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:'./http-loader.component.html',
  styleUrl: './http-loader.component.scss',
})
export class HttpLoaderComponent {
  readonly loader = inject(HttpLoaderService);
}
