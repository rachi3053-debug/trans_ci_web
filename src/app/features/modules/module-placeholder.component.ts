import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Page de substitution pour les modules metiers pas encore developpes.
 * Le titre provient des data de la route ; l'acces est protege par permissionGuard
 * (le ROOT bypass tout via AuthService.isRoot()).
 */
@Component({
  selector: 'app-module-placeholder',
  standalone: true,
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="mb-3">
            <h4 class="mb-1">{{ title }}</h4>
            <p class="text-muted mb-0">Module en cours de developpement.</p>
          </div>
          <div class="alert alert-info d-flex align-items-center" role="alert">
            <i class="bi bi-hammer me-2"></i>
            <div>Cette section du module <strong>{{ title }}</strong> sera bientot disponible.</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ModulePlaceholderComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return (this.route.snapshot.data['title'] as string) ?? 'Module';
  }
}