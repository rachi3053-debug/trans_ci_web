import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/services/auth.service';

const EXCLUDED_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

let isRefreshing = false;
let pendingRequests: ((token: string) => void)[] = [];

function buildHeaders(token: string, tokenService: TokenService): Record<string, string> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const tenantId = tokenService.getTenantId();
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId;
  }
  return headers;
}

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  if (EXCLUDED_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({ setHeaders: buildHeaders(token, tokenService) });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Un refresh est déjà en cours : on met la requête en attente et on la
        // rejouera avec le nouveau token dès qu'il sera disponible.
        if (isRefreshing) {
          return new Observable<HttpEvent<unknown>>((subscriber) => {
            const retry: (token: string) => void = (newToken) => {
              const retryReq = req.clone({
                setHeaders: buildHeaders(newToken, tokenService),
              });
              next(retryReq).subscribe({
                next: (event) => subscriber.next(event),
                error: (err) => subscriber.error(err),
                complete: () => subscriber.complete(),
              });
            };
            pendingRequests.push(retry);
            return () => {
              const index = pendingRequests.indexOf(retry);
              if (index !== -1) {
                pendingRequests.splice(index, 1);
              }
            };
          });
        }

        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            if (!res.accessToken) {
              pendingRequests = [];
              authService.logout();
              return throwError(() => error);
            }
            // On rejoue d'abord les requêtes mises en attente.
            pendingRequests.forEach((retry) => retry(res.accessToken));
            pendingRequests = [];
            const retryReq = req.clone({
              setHeaders: buildHeaders(res.accessToken, tokenService),
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            pendingRequests = [];
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }

      if (error.status === 403) {
        authService.router.navigate(['/forbidden']);
      }

      return throwError(() => error);
    }),
  );
};