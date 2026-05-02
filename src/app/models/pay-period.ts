import { ExpenseResponse } from './expense';
import { PayCheckResponse } from './pay-check';

export interface PayPeriodResponse {
  payCheck: PayCheckResponse;
  expenses: ExpenseResponse[];
  totalExpenses: number;
  net: number;
}
