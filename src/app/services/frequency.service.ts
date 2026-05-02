import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FrequencyResponse } from '../models/frequency';

@Injectable({ providedIn: 'root' })
export class FrequencyService {
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<FrequencyResponse[]>('/api/frequencies');
  }
}
