import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateRecurringExpenseRequest, RecurringExpenseResponse, UpdateRecurringExpenseRequest } from '../models/recurring-expense';

@Injectable({ providedIn: 'root' })
export class RecurringExpenseService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<RecurringExpenseResponse[]>('/api/recurring-expenses');
  }

  getById(id: number) {
    return this.http.get<RecurringExpenseResponse>(`/api/recurring-expenses/${id}`);
  }

  create(request: CreateRecurringExpenseRequest) {
    return this.http.post<RecurringExpenseResponse>('/api/recurring-expenses', request);
  }

  update(id: number, request: UpdateRecurringExpenseRequest) {
    return this.http.put<RecurringExpenseResponse>(`/api/recurring-expenses/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/recurring-expenses/${id}`);
  }
}
