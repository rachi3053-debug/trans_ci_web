import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-placeholder',
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Tableau de bord</mat-card-title>
        <mat-card-subtitle>Phase 1 — infrastructure</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>
          L’application TransCI est initialisée. Les indicateurs métier
          (voyages du jour, remplissage, recettes) arriveront en phase 5.
        </p>
      </mat-card-content>
    </mat-card>
  `,
})
export class DashboardPlaceholderComponent {}
