export interface PayScheduleResponse {
  payScheduleId: number;
  frequencyId: number;
  frequencyName: string;
  amount: number;
  description: string;
  startDate: string;
  endDate: string | null;
}

export interface CreatePayScheduleRequest {
  frequencyId: number;
  amount: number;
  description: string;
  startDate: string;
  endDate: string | null;
}

export interface UpdatePayScheduleRequest {
  frequencyId: number;
  amount: number;
  description: string;
  startDate: string;
  endDate: string | null;
}
