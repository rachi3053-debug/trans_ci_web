import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InactivityService } from '@/app/partager/inactivity.service';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl:'./session-warning-modal.component.html/'
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

