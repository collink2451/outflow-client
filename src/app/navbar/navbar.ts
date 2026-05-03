import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

const THEME_KEY = 'theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  currentPath = window.location.pathname;
  auth = inject(AuthService);
  isDark = signal(localStorage.getItem(THEME_KEY) === 'dark');
  menuOpen = signal(false);

  ngOnInit() {
    const state = this.isDark() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state);
  }

  toggleTheme() {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    this.isDark.set(next === 'dark');
    localStorage.setItem(THEME_KEY, next);
  }
}
