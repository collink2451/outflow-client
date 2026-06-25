export interface PlaidTransactionResponse {
  plaidTransactionId: string;
  plaidConnectionId: number;
  institutionName: string;
  name: string;
  date: string;
  amount: number;
}

export interface ApproveTransactionRequest {
  expenseCategoryId: number;
  description?: string;
}
