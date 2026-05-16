import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService, Client } from '../services/client';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.scss'
})
export class Clients implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = false;
  showModal = false;
  showDrawer = false;
  isEditing = false;
  selectedClient: Client | null = null;
  filterStatus = 'all';
  searchQuery = '';
  clientForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      name:          ['', Validators.required],
      email:         ['', Validators.email],
      phone:         [''],
      document:      [''],
      document_type: ['cpf'],
      address:       [''],
      city:          [''],
      state:         [''],
      zip_code:      [''],
      notes:         ['']
    });
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  applyFilter(): void {
    let result = this.clients;

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.document?.includes(q)
      );
    }

    if (this.filterStatus !== 'all') {
      result = result.filter(c => c.status === this.filterStatus);
    }

    this.filteredClients = result;
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openModal(client?: Client): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (client) {
      this.isEditing = true;
      this.selectedClient = client;
      this.clientForm.patchValue(client);
    } else {
      this.isEditing = false;
      this.selectedClient = null;
      this.clientForm.reset({ document_type: 'cpf' });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.clientForm.reset({ document_type: 'cpf' });
  }

  openDrawer(client: Client): void {
    this.selectedClient = client;
    this.showDrawer = true;
  }

  closeDrawer(): void {
    this.showDrawer = false;
    this.selectedClient = null;
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const data = this.clientForm.value;

    if (this.isEditing && this.selectedClient?.id) {
      this.clientService.update(this.selectedClient.id, data).subscribe({
        next: () => {
          this.successMessage = 'Cliente atualizado com sucesso!';
          this.loadClients();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: () => this.errorMessage = 'Erro ao atualizar cliente.'
      });
    } else {
      this.clientService.create(data).subscribe({
        next: () => {
          this.successMessage = 'Cliente cadastrado com sucesso!';
          this.loadClients();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: () => this.errorMessage = 'Erro ao cadastrar cliente.'
      });
    }
  }

  deleteClient(client: Client): void {
    if (!client.id) return;
    if (!confirm(`Excluir cliente ${client.name}?`)) return;
    this.clientService.delete(client.id).subscribe({
      next: () => this.loadClients()
    });
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const colors = ['#1a6cf6', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getStatusLabel(status: string): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  getRiskScore(client: Client): string {
    const scores = ['low', 'medium', 'high'];
    const index = (client.name.charCodeAt(0) + (client.id || 0)) % 3;
    return scores[index];
  }

  getRiskLabel(score: string): string {
    const map: Record<string, string> = { low: 'Baixo risco', medium: 'Médio risco', high: 'Alto risco' };
    return map[score];
  }

  get totalActive(): number {
    return this.clients.filter(c => c.status === 'active').length;
  }

  get totalInactive(): number {
    return this.clients.filter(c => c.status === 'inactive').length;
  }
}