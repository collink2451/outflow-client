import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

const THEME_KEY = 'theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  currentPath = window.location.pathname;
  auth = inject(AuthService);
  toast = inject(ToastService);
  isDark = signal(localStorage.getItem(THEME_KEY) !== 'light');
  menuOpen = signal(false);

  ngOnInit() {
    const state = this.isDark() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state);

    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'signup_disabled') {
      this.toast.show('Sign-ups are disabled. Contact the administrator to create an account.', 'error');
      history.replaceState(null, '', window.location.pathname);
    }
  }

  toggleTheme() {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this.isDark.set(next === 'dark');
    localStorage.setItem(THEME_KEY, next);
  }
}
