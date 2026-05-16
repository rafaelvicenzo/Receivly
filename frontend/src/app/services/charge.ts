import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Charge {
  id?: number;
  customer_name: string;
  customer_email?: string;
  customer_document?: string;
  description?: string;
  amount: number;
  due_date: string;
  status?: string;
  payment_method?: string;
  paid_at?: string;
  fine_amount?: number;
  interest_amount?: number;
  discount_amount?: number;
  notes?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChargeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Charge[]> {
    return this.http.get<Charge[]>(`${this.apiUrl}/charges`);
  }

  getById(id: number): Observable<Charge> {
    return this.http.get<Charge>(`${this.apiUrl}/charges/${id}`);
  }

  create(charge: Charge): Observable<Charge> {
    return this.http.post<Charge>(`${this.apiUrl}/charges`, charge);
  }

  update(id: number, charge: Partial<Charge>): Observable<Charge> {
    return this.http.put<Charge>(`${this.apiUrl}/charges/${id}`, charge);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/charges/${id}`);
  }

  markAsPaid(id: number): Observable<Charge> {
    return this.http.patch<Charge>(`${this.apiUrl}/charges/${id}/pay`, {});
  }
}