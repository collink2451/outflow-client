import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateRecurringExpenseRequest,
  RecurringExpenseResponse,
  UpdateRecurringExpenseRequest,
} from '../models/recurring-expense';

@Injectable({ providedIn: 'root' })
export class RecurringExpenseService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<RecurringExpenseResponse[]>('/api/recurringexpenses');
  }

  getById(id: number) {
    return this.http.get<RecurringExpenseResponse>(`/api/recurringexpenses/${id}`);
  }

  create(request: CreateRecurringExpenseRequest) {
    return this.http.post<RecurringExpenseResponse>('/api/recurringexpenses', request);
  }

  update(id: number, request: UpdateRecurringExpenseRequest) {
    return this.http.put<RecurringExpenseResponse>(`/api/recurringexpenses/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/recurringexpenses/${id}`);
  }
}
