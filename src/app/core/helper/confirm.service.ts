import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalconfirmComponent } from '@/app/layout/modalconfirm/modalconfirm.component';

export type ConfirmResult = boolean | { confirmed: true; reason: string };

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private readonly modalService: NgbModal) {}

  async confirm(text: string, modalTitle = 'Confirmation'): Promise<boolean> {
    const modalRef = this.modalService.open(ModalconfirmComponent, {
      size: 'default',
      backdrop: 'static',
    });
    modalRef.componentInstance.data = { modalTitle, text };
    try {
      const result: ConfirmResult = await modalRef.result;
      return result === true || (typeof result === 'object' && result?.confirmed === true);
    } catch {
      return false;
    }
  }

  confirmDelete(entityLabel: string): Promise<boolean> {
    return this.confirm(`Voulez-vous vraiment supprimer ${entityLabel} ?`);
  }
}
