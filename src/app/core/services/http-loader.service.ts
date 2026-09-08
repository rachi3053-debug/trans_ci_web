import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpLoaderService {
  private pending = 0;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  readonly isLoading = signal(false);

  show(): void {
    this.pending += 1;
    if (this.pending !== 1) {
      return;
    }
    this.showTimer = setTimeout(() => {
      if (this.pending > 0) {
        this.isLoading.set(true);
      }
    }, 150);
  }

  hide(): void {
    this.pending = Math.max(0, this.pending - 1);
    if (this.pending > 0) {
      return;
    }
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.isLoading.set(false);
  }
}
