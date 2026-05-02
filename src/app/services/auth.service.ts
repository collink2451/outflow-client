import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  user = signal<UserResponse | null>(null);

  loadUser() {
    this.http.get<UserResponse>('/auth/me').subscribe({
      next: user => this.user.set(user),
      error: () => this.user.set(null),
    });
  }

  logout() {
    return this.http.get<void>('/auth/logout');
  }
}
