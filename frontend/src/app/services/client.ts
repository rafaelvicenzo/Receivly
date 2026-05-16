import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  document_type?: 'cpf' | 'cnpj';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status?: 'active' | 'inactive';
  notes?: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(search?: string, status?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<Client[]>(`${this.apiUrl}/clients`, { params });
  }

  getById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, client);
  }

  update(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}`, client);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`);
  }
}