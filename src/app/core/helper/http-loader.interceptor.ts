import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpLoaderService } from '@core/services/http-loader.service';
import { finalize } from 'rxjs/operators';

export const SKIP_LOADER_HEADER = 'X-Skip-Loader';

const SKIP_URL_FRAGMENTS = [
  'auth/refresh',
  'assets/i18n',
  '/assets/',
];

function shouldSkip(url: string, skipHeader: boolean): boolean {
  if (skipHeader) {
    return true;
  }
  return SKIP_URL_FRAGMENTS.some((fragment) => url.includes(fragment));
}

export const httpLoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(HttpLoaderService);
  const skipHeader = req.headers.has(SKIP_LOADER_HEADER);
  const outgoing = skipHeader
    ? req.clone({ headers: req.headers.delete(SKIP_LOADER_HEADER) })
    : req;

  if (shouldSkip(req.url, skipHeader)) {
    return next(outgoing);
  }

  loader.show();
  return next(outgoing).pipe(finalize(() => loader.hide()));
};
