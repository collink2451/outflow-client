export interface ExpenseResponse {
  expenseId: number;
  expenseCategoryId: number;
  categoryName: string;
  description: string;
  date: string;
  amount: number;
}

export interface CreateExpenseRequest {
  expenseCategoryId: number;
  description: string;
  date: string;
  amount: number;
}

export interface UpdateExpenseRequest {
  expenseCategoryId: number;
  description: string;
  date: string;
  amount: number;
}
