import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreatePayScheduleRequest, PayScheduleResponse, UpdatePayScheduleRequest } from '../models/pay-schedule';

@Injectable({ providedIn: 'root' })
export class PayScheduleService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<PayScheduleResponse[]>('/api/pay-schedules');
  }

  getById(id: number) {
    return this.http.get<PayScheduleResponse>(`/api/pay-schedules/${id}`);
  }

  create(request: CreatePayScheduleRequest) {
    return this.http.post<PayScheduleResponse>('/api/pay-schedules', request);
  }

  update(id: number, request: UpdatePayScheduleRequest) {
    return this.http.put<PayScheduleResponse>(`/api/pay-schedules/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/pay-schedules/${id}`);
  }
}
