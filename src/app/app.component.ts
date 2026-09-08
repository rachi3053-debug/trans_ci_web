import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpLoaderComponent } from './components/http-loader/http-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpLoaderComponent],
  template: '<app-http-loader /><router-outlet />',
})
export class AppComponent {}