import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';

@Directive({
    selector: '[appHasNotPermission]',
    standalone: true
})
export class HasNotPermissionDirective implements OnInit {
    @Input() appHasNotPermission: string | string[] = '';

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
        const permissions = Array.isArray(this.appHasNotPermission)
            ? this.appHasNotPermission
            : [this.appHasNotPermission];

        this.permissionsService.hasPermission(permissions).then((hasPermission: boolean) => {
            // Show view if user does NOT have permission
            if (!hasPermission && !this.hasView) {
                this.viewContainer.createEmbeddedView(this.templateRef);
                this.hasView = true;
            } else if (hasPermission && this.hasView) {
                this.viewContainer.clear();
                this.hasView = false;
            }
        });
    }
}
