export interface ExpenseCategoryResponse {
  expenseCategoryId: number;
  name: string;
}

export interface CreateExpenseCategoryRequest {
  name: string;
}

export interface UpdateExpenseCategoryRequest {
  name: string;
}
