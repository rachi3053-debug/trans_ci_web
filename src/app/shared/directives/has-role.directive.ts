import { Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/auth/services/auth.service';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective implements OnInit {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  private roles: string[] = [];

  @Input() set appHasRole(value: string | string[]) {
    this.roles = Array.isArray(value) ? value : [value];
    this.updateView();
  }

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    this.vcr.clear();

    if (this.auth.hasAnyRole(this.roles)) {
      this.vcr.createEmbeddedView(this.templateRef);
    }
  }
}
