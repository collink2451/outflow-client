export interface PlaidConnectionResponse {
  plaidConnectionId: number;
  institutionName: string;
  institutionId: string;
}

export interface ExchangeTokenRequest {
  publicToken: string;
  institutionId: string;
  institutionName: string;
}
