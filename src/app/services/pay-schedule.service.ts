import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreatePayScheduleRequest,
  PayScheduleResponse,
  UpdatePayScheduleRequest,
} from '../models/pay-schedule';

@Injectable({ providedIn: 'root' })
export class PayScheduleService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<PayScheduleResponse[]>('/api/payschedules');
  }

  getById(id: number) {
    return this.http.get<PayScheduleResponse>(`/api/payschedules/${id}`);
  }

  create(request: CreatePayScheduleRequest) {
    return this.http.post<PayScheduleResponse>('/api/payschedules', request);
  }

  update(id: number, request: UpdatePayScheduleRequest) {
    return this.http.put<PayScheduleResponse>(`/api/payschedules/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/payschedules/${id}`);
  }
}
