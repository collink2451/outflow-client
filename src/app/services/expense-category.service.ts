import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  CreateExpenseCategoryRequest,
  ExpenseCategoryResponse,
  UpdateExpenseCategoryRequest,
} from '../models/expense-category';

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<ExpenseCategoryResponse[]>('/api/expensecategories');
  }

  create(request: CreateExpenseCategoryRequest) {
    return this.http.post<ExpenseCategoryResponse>('/api/expensecategories', request);
  }

  update(id: number, request: UpdateExpenseCategoryRequest) {
    return this.http.put<ExpenseCategoryResponse>(`/api/expensecategories/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/expensecategories/${id}`);
  }
}
