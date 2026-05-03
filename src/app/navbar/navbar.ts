import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  currentPath = window.location.pathname;
  auth = inject(AuthService);
  isDark = signal(document.documentElement.getAttribute('data-theme') !== 'light');
  menuOpen = signal(false);

  toggleTheme() {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this.isDark.set(next === 'dark');
  }
}
