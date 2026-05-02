import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UserResponse } from '../models/user';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<UserResponse | null | undefined>(this.loadFromStorage());

  loadUser() {
    this.http.get<UserResponse>('/auth/me').subscribe({
      next: (user) => {
        this.user.set(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      },
      error: () => {
        this.user.set(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    });
  }

  logout() {
    return this.http.get<void>('/auth/logout');
  }

  private loadFromStorage(): UserResponse | null | undefined {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : undefined;
  }
}
