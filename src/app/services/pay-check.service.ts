import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreatePayCheckRequest,
  PayCheckResponse,
  UpdatePayCheckRequest,
} from '../models/pay-check';

@Injectable({ providedIn: 'root' })
export class PayCheckService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<PayCheckResponse[]>('/api/paychecks');
  }

  getById(id: number) {
    return this.http.get<PayCheckResponse>(`/api/paychecks/${id}`);
  }

  create(request: CreatePayCheckRequest) {
    return this.http.post<PayCheckResponse>('/api/paychecks', request);
  }

  update(id: number, request: UpdatePayCheckRequest) {
    return this.http.put<PayCheckResponse>(`/api/paychecks/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/paychecks/${id}`);
  }
}
