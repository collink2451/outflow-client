import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UpdateUserRequest, UserResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMe() {
    return this.http.get<UserResponse>('/api/users/me');
  }

  updateMe(request: UpdateUserRequest) {
    return this.http.put<UserResponse>('/api/users/me', request);
  }

  deleteMe() {
    return this.http.delete<void>('/api/users/me');
  }
}
