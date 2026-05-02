import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(AuthService);
  isDark = signal(document.documentElement.getAttribute('data-theme') !== 'light');

  toggleTheme() {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this.isDark.set(next === 'dark');
  }
}
