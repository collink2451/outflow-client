import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateExpenseRequest, ExpenseResponse, UpdateExpenseRequest } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<ExpenseResponse[]>('/api/expenses');
  }

  getById(id: number) {
    return this.http.get<ExpenseResponse>(`/api/expenses/${id}`);
  }

  create(request: CreateExpenseRequest) {
    return this.http.post<ExpenseResponse>('/api/expenses', request);
  }

  update(id: number, request: UpdateExpenseRequest) {
    return this.http.put<ExpenseResponse>(`/api/expenses/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/expenses/${id}`);
  }
}
