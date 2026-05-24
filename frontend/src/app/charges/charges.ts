import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargeService, Charge } from '../services/charge';
import { ClientService, Client } from '../services/client';
import { ChargesSkeletonComponent } from './charges-skeleton/charges-skeleton';
import { PaginationComponent } from '../shared/pagination.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChargesSkeletonComponent, PaginationComponent],
  templateUrl: './charges.html',
  styleUrl: './charges.scss'
})
export class Charges implements OnInit {
  charges: Charge[] = [];
  filteredCharges: Charge[] = [];
  pagedCharges: Charge[] = [];
  clients: Client[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  selectedCharge: Charge | null = null;
  filterStatus = 'all';
  chargeForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  searchQuery = '';

  // Paginação
  currentPage = 1;
  pageSize = 5;

  constructor(
    private chargeService: ChargeService,
    private clientService: ClientService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCharges();
    this.loadClients();
    this.route.queryParams.subscribe(params => {
      if (params['openModal']) this.openModal();
    });
  }

  initForm(): void {
    this.chargeForm = this.fb.group({
      client_id:         [null],
      customer_name:     ['', Validators.required],
      customer_email:    ['', Validators.email],
      customer_document: [''],
      description:       [''],
      amount:            ['', [Validators.required, Validators.min(5)]],
      due_date:          ['', Validators.required],
      payment_method:    ['pix'],
      notes:             ['']
    });

    this.chargeForm.get('payment_method')?.valueChanges.subscribe(method => {
      const docControl = this.chargeForm.get('customer_document');
      if (method === 'pix' || method === 'boleto') {
        docControl?.setValidators([Validators.required]);
      } else {
        docControl?.clearValidators();
      }
      docControl?.updateValueAndValidity();
    });

    this.chargeForm.get('payment_method')?.setValue('pix');

    this.chargeForm.get('client_id')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        const client = this.clients.find(c => c.id == clientId);
        if (client) {
          this.chargeForm.patchValue({
            customer_name:     client.name,
            customer_email:    client.email || '',
            customer_document: client.document || ''
          }, { emitEvent: false });
        }
      }
    });
  }

  loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (data) => this.clients = data
    });
  }

  formatDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }

    input.value = value;
    this.chargeForm.get('customer_document')?.setValue(value);
  }

  get documentInvalid(): boolean {
    const control = this.chargeForm.get('customer_document');
    return !!control && control.invalid && control.touched;
  }

  loadCharges(): void {
    this.isLoading = true;
    this.chargeService.getAll().subscribe({
      next: (data) => {
        this.charges = data;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
  let result = this.filterStatus === 'all'
    ? this.charges
    : this.charges.filter(c => c.status === this.filterStatus);

  if (this.searchQuery) {
    const q = this.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_email?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  }

    this.filteredCharges = result;
    this.currentPage = 1;
    this.updatePage();
  }

  updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedCharges = this.filteredCharges.slice(start, start + this.pageSize);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePage();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updatePage();
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  openModal(charge?: Charge): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (charge) {
      this.isEditing = true;
      this.selectedCharge = charge;
      this.chargeForm.patchValue({
        ...charge,
        due_date: charge.due_date?.substring(0, 10)
      });
    } else {
      this.isEditing = false;
      this.selectedCharge = null;
      this.chargeForm.reset({ payment_method: 'pix' });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.chargeForm.reset({ payment_method: 'pix' });
  }

  onSubmit(): void {
    if (this.chargeForm.invalid) {
      this.chargeForm.markAllAsTouched();
      return;
    }

    const data = this.chargeForm.value;

    if (this.isEditing && this.selectedCharge?.id) {
      this.chargeService.update(this.selectedCharge.id, data).subscribe({
        next: () => {
          this.successMessage = 'Cobrança atualizada com sucesso!';
          this.loadCharges();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: () => this.errorMessage = 'Erro ao atualizar cobrança.'
      });
    } else {
      this.chargeService.create(data).subscribe({
        next: () => {
          this.successMessage = 'Cobrança criada com sucesso!';
          this.loadCharges();
          setTimeout(() => this.closeModal(), 1000);
        },
        error: () => this.errorMessage = 'Erro ao criar cobrança.'
      });
    }
  }

  markAsPaid(charge: Charge): void {
    if (!charge.id) return;
    this.chargeService.markAsPaid(charge.id).subscribe({
      next: () => this.loadCharges()
    });
  }

  deleteCharge(charge: Charge): void {
    if (!charge.id) return;
    if (!confirm(`Excluir cobrança de ${charge.customer_name}?`)) return;
    this.chargeService.delete(charge.id).subscribe({
      next: () => this.loadCharges()
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendente', paid: 'Pago', overdue: 'Vencido', cancelled: 'Cancelado'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pendente', paid: 'status-pago',
      overdue: 'status-vencido', cancelled: 'status-cancelado'
    };
    return map[status] || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  get totalPending(): number {
    return this.charges.filter(c => c.status === 'pending').reduce((s, c) => s + Number(c.amount), 0);
  }

  get totalOverdue(): number {
    return this.charges.filter(c => c.status === 'overdue').reduce((s, c) => s + Number(c.amount), 0);
  }

  get totalPaid(): number {
    return this.charges.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.amount), 0);
  }
}