import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../auth/token.service';
import { AuthService } from '../auth/services/auth.service';

const EXCLUDED_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

let isRefreshing = false;

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

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !isRefreshing) {
        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap((res) => {
            isRefreshing = false;
            if (res.accessToken) {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.accessToken}` },
              });
              return next(retryReq);
            }
            authService.logout();
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
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
