import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private permission = '';
  private mode: 'one' | 'any' | 'all' = 'one';

  @Input() set appHasPermission(value: string | string[]) {
    if (Array.isArray(value)) {
      this.permission = '';
      this.mode = value.length === 1 ? 'one' : 'any';
    } else {
      this.permission = value;
      this.mode = 'one';
    }
  }

  @Input() appHasPermissionMode: 'one' | 'any' | 'all' = 'one';

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    this.vcr.clear();

    let hasAccess = false;

    if (this.mode === 'one' && this.permission) {
      hasAccess = this.auth.hasPermission(this.permission);
    } else if (this.mode === 'all') {
      hasAccess = this.auth.hasAllPermissions(Array.isArray(this.permission)
        ? [this.permission] : []);
    } else {
      hasAccess = this.auth.hasAnyPermission(Array.isArray(this.permission)
        ? [this.permission] : []);
    }

    if (hasAccess) {
      this.vcr.createEmbeddedView(this.templateRef);
    }
  }
}
