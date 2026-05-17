import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface RuleStep {
  id: number;
  days: number;
  timing: 'before' | 'due' | 'after';
  channel: 'whatsapp' | 'email' | 'sms';
  enabled: boolean;
  message: string;
}

export interface CollectionRule {
  id?: number;
  name: string;
  enabled: boolean;
  is_default: boolean;
  steps: RuleStep[];
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionRuleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CollectionRule[]> {
    return this.http.get<CollectionRule[]>(`${this.apiUrl}/collection-rules`);
  }

  getDefault(): Observable<CollectionRule> {
    return this.http.get<CollectionRule>(`${this.apiUrl}/collection-rules/default`);
  }

  create(rule: CollectionRule): Observable<CollectionRule> {
    return this.http.post<CollectionRule>(`${this.apiUrl}/collection-rules`, rule);
  }

  update(id: number, rule: Partial<CollectionRule>): Observable<CollectionRule> {
    return this.http.put<CollectionRule>(`${this.apiUrl}/collection-rules/${id}`, rule);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/collection-rules/${id}`);
  }

  setDefault(id: number): Observable<CollectionRule> {
    return this.http.patch<CollectionRule>(`${this.apiUrl}/collection-rules/${id}/set-default`, {});
  }
}