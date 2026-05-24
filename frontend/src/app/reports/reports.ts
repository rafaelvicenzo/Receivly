import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService, ReportData } from '../services/report';
import { ReportsSkeletonComponent } from './reports-skeleton/reports-skeleton';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReportsSkeletonComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports implements OnInit {
  report: ReportData | null = null;
  isLoading = true;
  Math = Math;

  private chartInstances: any[] = [];

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    this.chartInstances.forEach(c => c?.destroy());
    this.chartInstances = [];

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

  getMethodTotal(): number {
    if (!this.report) return 0;
    return this.report.by_method.pix + this.report.by_method.boleto + this.report.by_method.cartao;
  }

  getMethodBreakdown(): { label: string; pct: number; color: string }[] {
    if (!this.report) return [];
    const total = this.getMethodTotal();
    if (!total) return [
      { label: 'Pix',    pct: 0, color: '#3b82f6' },
      { label: 'Boleto', pct: 0, color: '#8b5cf6' },
      { label: 'Cartão', pct: 0, color: '#06b6d4' },
    ];
    return [
      { label: 'Pix',    pct: Math.round((this.report.by_method.pix    / total) * 100), color: '#3b82f6' },
      { label: 'Boleto', pct: Math.round((this.report.by_method.boleto / total) * 100), color: '#8b5cf6' },
      { label: 'Cartão', pct: Math.round((this.report.by_method.cartao / total) * 100), color: '#06b6d4' },
    ];
  }

  getInitial(name: string): string {
    return name?.charAt(0).toUpperCase() || '';
  }

  get maxDebtorAmount(): number {
    if (!this.report?.top_debtors?.length) return 0;
    return Math.max(...this.report.top_debtors.map((d: any) => d.amount));
  }

  get maxPayerAmount(): number {
    if (!this.report?.top_payers?.length) return 0;
    return Math.max(...this.report.top_payers.map((p: any) => p.amount));
  }

  getRelativeWidth(amount: number, max: number): number {
    return max ? Math.round((amount / max) * 100) : 0;
  }

  renderCharts(): void {
    if (!this.report) return;
    this.renderMonthlyChart();
    this.renderStatusChart();
    this.renderMethodChart();
  }

  private getChart(): any {
    return (window as any).Chart;
  }

  renderMonthlyChart(): void {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const Chart = this.getChart();
    if (!Chart) return;

    const instance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.report.monthly_data.map((d: any) => d.label),
        datasets: [
          {
            label: 'Recebido',
            data: this.report.monthly_data.map((d: any) => d.received),
            backgroundColor: '#3b82f6',
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: 'Esperado',
            data: this.report.monthly_data.map((d: any) => d.expected),
            backgroundColor: '#e2e8f0',
            borderRadius: 6,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ' ' + new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ctx.parsed.y)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { size: 12, family: 'Sora, sans-serif' } }
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#94a3b8',
              font: { size: 12, family: 'Sora, sans-serif' },
              callback: (v: any) => {
                if (v >= 1000) return 'R$' + (v / 1000).toFixed(0) + 'k';
                return 'R$' + v;
              }
            }
          }
        }
      }
    });

    this.chartInstances.push(instance);
  }

  renderStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const Chart = this.getChart();
    if (!Chart) return;

    const instance = new Chart(ctx, {
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
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444', '#cbd5e1'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ' ' + ctx.label + ': ' + ctx.parsed
            }
          }
        }
      }
    });

    this.chartInstances.push(instance);
  }

  renderMethodChart(): void {
    const canvas = document.getElementById('methodChart') as HTMLCanvasElement;
    if (!canvas || !this.report) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const Chart = this.getChart();
    if (!Chart) return;

    const instance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pix', 'Boleto', 'Cartão'],
        datasets: [{
          data: [
            this.report.by_method.pix,
            this.report.by_method.boleto,
            this.report.by_method.cartao
          ],
          backgroundColor: ['#3b82f6', '#8b5cf6', '#06b6d4'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ' ' + ctx.label + ': ' + ctx.parsed
            }
          }
        }
      }
    });

    this.chartInstances.push(instance);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
}