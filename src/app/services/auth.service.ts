import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  me() {
    return this.http.get<UserResponse>('/auth/me');
  }

  logout() {
    return this.http.get<void>('/auth/logout');
  }
}
