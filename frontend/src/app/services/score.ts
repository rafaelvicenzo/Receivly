import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface ClientScore {
  client_id: number;
  client_name: string;
  score: number;
  risk: 'low' | 'medium' | 'high';
  risk_label: string;
  factors?: string[];
  analysis?: string;
  total_charges?: number;
  paid?: number;
  overdue?: number;
  pending?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getClientScore(clientId: number): Observable<ClientScore> {
    return this.http.get<ClientScore>(`${this.apiUrl}/score/client/${clientId}`);
  }

  getAllScores(): Observable<ClientScore[]> {
    return this.http.get<ClientScore[]>(`${this.apiUrl}/score/all`);
  }
}