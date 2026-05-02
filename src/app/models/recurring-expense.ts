export interface RecurringExpenseResponse {
  recurringExpenseId: number;
  frequencyId: number;
  frequencyName: string;
  expenseCategoryId: number;
  categoryName: string;
  description: string;
  startDate: string;
  amount: number;
}

export interface CreateRecurringExpenseRequest {
  frequencyId: number;
  expenseCategoryId: number;
  description: string;
  startDate: string;
  amount: number;
}

export interface UpdateRecurringExpenseRequest {
  frequencyId: number;
  expenseCategoryId: number;
  description: string;
  startDate: string;
  amount: number;
}
