import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InactivityService } from '@/app/partager/inactivity.service';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header border-0">
      <h5 class="modal-title text-danger">
        <i class="bi bi-clock-history me-2"></i>
        Avertissement de session
      </h5>
    </div>
    
    <div class="modal-body text-center py-4">
      <div class="mb-4">
        <i class="bi bi-clock-history" style="font-size: 4rem; color: #f59e0b;"></i>
      </div>
      <h5 class="mb-3">Session expirante</h5>
      <p class="text-muted mb-3">
        Votre session expirera dans <strong class="text-danger">{{ getTimeRemaining() }}</strong>
      </p>
      <div class="alert alert-warning">
        <i class="bi bi-exclamation-octagon me-2"></i>
        Effectuez une action pour rester connecté.
      </div>
    </div>

    <div class="modal-footer border-0">
      <button type="button" class="btn btn-primary w-100" (click)="stayConnected()">
        <i class="bi bi-check-lg me-2"></i>
        Rester connecté
      </button>
    </div>
  `
})
export class SessionWarningModalComponent implements OnDestroy {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private inactivityService: InactivityService,
    private cdr: ChangeDetectorRef
  ) {
    this.intervalId = setInterval(() => this.cdr.markForCheck(), 1_000);
  }

  getTimeRemaining(): string {
    return this.inactivityService.getFormattedTimeRemaining();
  }

  stayConnected(): void {
    this.inactivityService.resetInactivityTimer();
    this.activeModal.close(true);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

