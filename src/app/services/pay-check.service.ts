import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatePayCheckRequest, PayCheckResponse, UpdatePayCheckRequest } from '../models/pay-check';

@Injectable({ providedIn: 'root' })
export class PayCheckService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<PayCheckResponse[]>('/api/pay-checks');
  }

  getById(id: number) {
    return this.http.get<PayCheckResponse>(`/api/pay-checks/${id}`);
  }

  create(request: CreatePayCheckRequest) {
    return this.http.post<PayCheckResponse>('/api/pay-checks', request);
  }

  update(id: number, request: UpdatePayCheckRequest) {
    return this.http.put<PayCheckResponse>(`/api/pay-checks/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/pay-checks/${id}`);
  }
}
