import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ReportData {
  monthly_data:   { label: string; received: number; expected: number }[];
  status_dist:    { paid: number; pending: number; overdue: number; cancelled: number; total: number };
  by_method:      { pix: number; boleto: number; cartao: number };
  top_debtors:    { name: string; amount: number; count: number }[];
  top_payers:     { name: string; amount: number; count: number }[];
  avg_ticket:     number;
  inadimplencia:  number;
  total_received: number;
  total_overdue:  number;
  total_pending:  number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReports(): Observable<ReportData> {
    return this.http.get<ReportData>(`${this.apiUrl}/reports`);
  }
}