import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Directive({
  selector: '[appDisableIfPermission]',
  standalone: true
})
export class DisableIfPermissionDirective implements OnInit {
  @Input() appDisableIfPermission: string | string[] = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    this.checkPermission();
  }

  private checkPermission(): void {
    const permissions = Array.isArray(this.appDisableIfPermission)
      ? this.appDisableIfPermission
      : [this.appDisableIfPermission];

    this.permissionsService.hasPermission(permissions).then((hasPermission: boolean) => {
      if (!hasPermission) {
        // Disable element if user doesn't have permission
        this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
        this.renderer.addClass(this.el.nativeElement, 'disabled');
      } else {
        // Enable element if user has permission
        this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
        this.renderer.removeClass(this.el.nativeElement, 'disabled');
      }
    });
  }
}

