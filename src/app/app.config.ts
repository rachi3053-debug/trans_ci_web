import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideToastr } from 'ngx-toastr';
import { NgxPermissionsModule } from 'ngx-permissions';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { apiUnwrapInterceptor } from './core/interceptors/api-unwrap.interceptor';
import { httpLoaderInterceptor } from './core/helper/http-loader.interceptor';
import { layoutReducer } from '../store/layout/layout-reducers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([apiUnwrapInterceptor, httpLoaderInterceptor, authInterceptor, apiErrorInterceptor]),
    ),
    provideAnimations(),
    provideStore({ layout: layoutReducer }),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
      preventDuplicates: true,
    }),
    ...(NgxPermissionsModule.forRoot().providers ?? []),
  ],
};