import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { Observable, map } from 'rxjs';

export const apiUnwrapInterceptor: HttpInterceptorFn = (
  req,
  next,
): Observable<HttpEvent<unknown>> =>
  next(req).pipe(
    map((event) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      const body = event.body;
      if (
        typeof body !== 'object' ||
        body === null ||
        (body as Record<string, unknown>)['success'] !== true ||
        !('data' in (body as Record<string, unknown>))
      ) {
        return event;
      }

      return event.clone({ body: (body as { data: unknown }).data as unknown });
    }),
  );