import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PayPeriodResponse } from '../models/pay-period';

@Injectable({ providedIn: 'root' })
export class PayPeriodService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<PayPeriodResponse[]>('/api/payperiods');
  }
}
