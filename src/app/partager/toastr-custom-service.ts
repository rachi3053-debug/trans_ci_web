import { Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

const TOAST_OPTIONS: Partial<IndividualConfig> = {
  timeOut: 3000,
  positionClass: 'toast-top-right',
  closeButton: true,
  progressBar: true,
};

@Injectable({
  providedIn: 'root'
})

export class ToastrCustomService {
  constructor( private toastr: ToastrService) {}

  public toastType = {
    success: 'success',
    info: 'info',
    warn: 'warn',
    error: 'error',
    contrast: 'contrast',
    secondary: 'secondary',
  }

  showSuccessToastr(msg: string = 'Opération effectuée avec succès.', title: string = 'Succès') {
    this.toastr.success(msg, title, TOAST_OPTIONS);
  }

  showErrorToastr(msg: string = 'Oups, une erreur est survenue', title: string = 'Erreur') {
    this.toastr.error(msg, title, TOAST_OPTIONS);
  }

  showInfoToastr(msg: string = 'Information', title: string = 'Info') {
    this.toastr.info(msg, title, TOAST_OPTIONS);
  }

  showWarningToastr(msg: string = 'Attention', title: string = 'Attention') {
    this.toastr.warning(msg, title, TOAST_OPTIONS);
  }
}
