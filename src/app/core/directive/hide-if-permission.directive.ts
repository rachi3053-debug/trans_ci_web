import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Directive({
  selector: '[appHideIfPermission]',
  standalone: true
})
export class HideIfPermissionDirective implements OnInit {
  @Input() appHideIfPermission: string | string[] = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    this.checkPermission();
  }

  private checkPermission(): void {
    const permissions = Array.isArray(this.appHideIfPermission)
      ? this.appHideIfPermission
      : [this.appHideIfPermission];

    this.permissionsService.hasPermission(permissions).then((hasPermission: boolean) => {
      if (hasPermission) {
        // Hide element if user has permission
        this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
      } else {
        // Show element if user doesn't have permission
        this.renderer.removeStyle(this.el.nativeElement, 'display');
      }
    });
  }
}

