import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modalconfirm',
  imports: [FormsModule],
  templateUrl: './modalconfirm.component.html',
  styleUrl: './modalconfirm.component.scss',
})
export class ModalconfirmComponent implements OnInit {
  @Input() data: any;
  titre: string = '';
  text: string = '';
  generatedPassword: string | null = null;
  askReason = false;
  reasonLabel = 'Raison';
  reasonPlaceholder = 'Saisissez une raison';
  reasonRequired = false;
  reason = '';
  copied = false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit() {
    this.titre = this.data.modalTitle;
    this.text = this.data.text;
    this.generatedPassword = this.data.generatedPassword ?? null;
    this.askReason = this.data.askReason === true;
    this.reasonLabel = this.data.reasonLabel ?? 'Raison';
    this.reasonPlaceholder = this.data.reasonPlaceholder ?? 'Saisissez une raison';
    this.reasonRequired = this.data.reasonRequired === true;
    this.reason = this.data.reason ?? '';
  }

  closeModal(status: boolean) {
    if (!status) {
      this.activeModal.close(false);
      return;
    }

    if (this.askReason) {
      const reason = this.reason.trim();
      if (this.reasonRequired && !reason) {
        return;
      }
      this.activeModal.close({ confirmed: true, reason });
      return;
    }

    this.activeModal.close(true);
  }

  copyPassword(): void {
    if (!this.generatedPassword) {
      return;
    }
    const done = () => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(this.generatedPassword).then(done).catch(() => this.copyPasswordFallback(done));
    } else {
      this.copyPasswordFallback(done);
    }
  }

  private copyPasswordFallback(after: () => void): void {
    if (!this.generatedPassword) {
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = this.generatedPassword;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
    after();
  }
}