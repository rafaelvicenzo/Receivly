import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, ReportData } from '../services/report';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {
  report: ReportData | null = null;
  isLoading = true;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getReports().subscribe({
      next: (data) => {
        this.report = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: () => { this.isLoading = false; }
    });
  }

  renderCharts(): void {
    if (!this.report) return;
    this.renderMonthlyChart();
    this.renderStatusChart();
    this.renderMethodChart();
  }

  renderMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.report.monthly_data.map(d => d.label),
        datasets: [
          {
            label: 'Recebido',
            data: this.report.monthly_data.map(d => d.received),
            backgroundColor: '#1a6cf6',
            borderRadius: 6,
          },
          {
            label: 'Esperado',
            data: this.report.monthly_data.map(d => d.expected),
            backgroundColor: '#e8eaf0',
            borderRadius: 6,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  renderStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pago', 'Pendente', 'Vencido', 'Cancelado'],
        datasets: [{
          data: [
            this.report.status_dist.paid,
            this.report.status_dist.pending,
            this.report.status_dist.overdue,
            this.report.status_dist.cancelled
          ],
          backgroundColor: ['#16a34a', '#d97706', '#dc2626', '#94a3b8'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        cutout: '65%'
      }
    });
  }

  renderMethodChart(): void {
    const canvas = document.getElementById('methodChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const Chart = (window as any).Chart;
    if (!Chart) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pix', 'Boleto', 'Cartão'],
        datasets: [{
          data: [
            this.report.by_method.pix,
            this.report.by_method.boleto,
            this.report.by_method.cartao
          ],
          backgroundColor: ['#1a6cf6', '#7c3aed', '#0891b2'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        cutout: '65%'
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
}