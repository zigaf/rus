import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AlertComponent } from './components/alert/alert.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AlertComponent],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-alert></app-alert>
  `,
  styles: []
})
export class AppComponent {
  title = 'Руслана Москаленко';
}

