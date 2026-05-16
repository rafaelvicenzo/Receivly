import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargeService, Charge } from '../services/charge';

@Component({
  selector: 'app-charges',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './charges.html',
  styleUrl: './charges.scss'
})
export class Charges implements OnInit {
  charges: Charge[] = [];
  filteredCharges: Charge[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  selectedCharge: Charge | null = null;
  filterStatus = 'all';
  chargeForm!: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private chargeService: ChargeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCharges();
  }

  initForm(): void {
    this.chargeForm = this.fb.group({
      customer_name:     ['', Validators.required],
      customer_email:    ['', Validators.email],
      customer_document: [''],
      description:       [''],
      amount:            ['', [Validators.required, Validators.min(0.01)]],
      due_date:          ['', Validators.required],
      payment_method:    ['pix'],
      notes:             ['']
    });
  }

  loadCharges(): void {
    this.isLoading = true;
    this.chargeService.getAll().subscribe({
      next: (data) => {
        this.charges = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredCharges = this.charges;
    } else {
      this.filteredCharges = this.charges.filter(c => c.status === this.filterStatus);
    }
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
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pendente',
      paid: 'status-pago',
      overdue: 'status-vencido',
      cancelled: 'status-cancelado'
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