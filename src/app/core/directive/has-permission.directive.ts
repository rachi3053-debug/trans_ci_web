import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission: string | string[] = '';

  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: NgxPermissionsService
  ) { }

  ngOnInit(): void {
    this.checkPermission();
  }

  private checkPermission(): void {
    const permissions = Array.isArray(this.appHasPermission)
      ? this.appHasPermission
      : [this.appHasPermission];

    this.permissionsService.hasPermission(permissions).then((hasPermission: boolean) => {
      if (hasPermission && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!hasPermission && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}

