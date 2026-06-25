import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExchangeTokenRequest, PlaidConnectionResponse } from '../models/plaid-connection';
import { ApproveTransactionRequest, PlaidTransactionResponse } from '../models/plaid-transaction';

@Injectable({ providedIn: 'root' })
export class PlaidService {
  private http = inject(HttpClient);

  getConnections() {
    return this.http.get<PlaidConnectionResponse[]>('/api/plaid/connections');
  }

  deleteConnection(id: number) {
    return this.http.delete<void>(`/api/plaid/connections/${id}`);
  }

  getLinkToken() {
    return this.http.post<{ linkToken: string }>('/api/plaid/link-token', {});
  }

  exchangeToken(request: ExchangeTokenRequest) {
    return this.http.post<void>('/api/plaid/exchange-token', request);
  }

  sync() {
    return this.http.post<void>('/api/plaid/sync', {});
  }

  getStaged() {
    return this.http.get<PlaidTransactionResponse[]>('/api/plaid/staged');
  }

  approveTransaction(plaidTransactionId: string, request: ApproveTransactionRequest) {
    return this.http.post<void>(`/api/plaid/staged/${plaidTransactionId}/approve`, request);
  }

  dismissTransaction(plaidTransactionId: string) {
    return this.http.delete<void>(`/api/plaid/staged/${plaidTransactionId}`);
  }
}
