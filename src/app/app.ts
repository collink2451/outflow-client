import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';
import { AuthService } from './services/auth.service';
import { Toast } from './toast/toast';

@Component({
  selector: 'app-root',
  imports: [Navbar, Footer, RouterOutlet, Toast],
  templateUrl: './app.html',
})
export class App {
  private auth = inject(AuthService);

  constructor() {
    this.auth.loadUser();
  }
}
