import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface DashboardMetrics {
  total_received: number;
  total_pending: number;
  total_overdue: number;
  total_paid_month: number;
  inadimplencia: number;
  total_charges: number;
  overdue_count: number;
  total_clients: number;
  recent_charges: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.apiUrl}/dashboard/metrics`);
  }

  getChartData(): Observable<{ label: string; value: number }[]> {
    return this.http.get<{ label: string; value: number }[]>(`${this.apiUrl}/dashboard/chart`);
  }
}