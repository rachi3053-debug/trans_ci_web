import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Debounce des recherches liste (un HTTP par frappe sinon).
 * Usage : injecter, appeler `bind(() => this.searchXxx())`, et `this.searchDebounce.next()` depuis (input).
 */
@Injectable()
export class SearchDebounce implements OnDestroy {
  private readonly subject = new Subject<void>();
  private sub?: { unsubscribe(): void };

  bind(run: () => void | Promise<void>, delayMs = 300): void {
    this.sub?.unsubscribe();
    this.sub = this.subject.pipe(debounceTime(delayMs)).subscribe(() => {
      void run();
    });
  }

  next(): void {
    this.subject.next();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subject.complete();
  }
}
