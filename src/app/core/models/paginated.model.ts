import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, expand, reduce } from 'rxjs';

/**
 * Format de réponse paginée renvoye par l'API backend (PaginatedResponseDto).
 * Apres l'apiUnwrapInterceptor, le corps est { data, meta, links }.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationLinks {
  first: string;
  previous: string | null;
  next: string | null;
  last: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

const PAGE_SIZE = 100;

/**
 * Recupere TOUTES les pages d'un endpoint pagine et les concatene.
 * Le backend plafonne `limit` a 100 (PaginationDto), on boucle donc sur `page`.
 */
export function fetchAllPages<T>(
  http: HttpClient,
  url: string,
): Observable<T[]> {
  const getPage = (page: number): Observable<PaginatedResponse<T>> =>
    http.get<PaginatedResponse<T>>(url, {
      params: { page: String(page), limit: String(PAGE_SIZE) },
    });

  return getPage(1).pipe(
    expand((res) =>
      res.meta.page < res.meta.totalPages ? getPage(res.meta.page + 1) : EMPTY,
    ),
    reduce((acc, res) => [...acc, ...res.data], [] as T[]),
  );
}