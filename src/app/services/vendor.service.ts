import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateVendorRequest, UpdateVendorRequest, VendorResponse } from '../models/vendor';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<VendorResponse[]>('/api/vendors');
  }

  create(request: CreateVendorRequest) {
    return this.http.post<VendorResponse>('/api/vendors', request);
  }

  update(id: number, request: UpdateVendorRequest) {
    return this.http.put<VendorResponse>(`/api/vendors/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`/api/vendors/${id}`);
  }
}
