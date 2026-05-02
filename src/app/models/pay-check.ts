export interface PayCheckResponse {
  payCheckId: number;
  amount: number;
  date: string;
}

export interface CreatePayCheckRequest {
  amount: number;
  date: string;
}

export interface UpdatePayCheckRequest {
  amount: number;
  date: string;
}
