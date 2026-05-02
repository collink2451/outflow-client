import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateExpenseCategoryRequest, ExpenseCategoryResponse, UpdateExpenseCategoryRequest } from '../models/expense-category';

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<ExpenseCategoryResponse[]>('/api/expense-categories');
  }

  create(request: CreateExpenseCategoryRequest) {
    return this.http.post<ExpenseCategoryResponse>('/api/expense-categories', request);
  }

  update(id: number, request: UpdateExpenseCategoryRequest) {
    return this.http.put<ExpenseCategoryResponse>(`/api/expense-categories/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/expense-categories/${id}`);
  }
}
