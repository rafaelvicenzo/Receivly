import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService, DashboardMetrics } from '../services/dashboard';
import { AiChatService } from '../services/ai-chat';
import { DashboardSkeletonComponent } from './dashboard-skeleton/dashboard-skeleton';
import { ClientService, ImportResult } from '../services/client';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardSkeletonComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  metrics!: DashboardMetrics;
  isLoading = true;
  chatMessages: { role: string; content: string }[] = [];
  chatInput = '';
  isTyping = false;
  recentCharges: any[] = [];
  chartData: { label: string; value: number }[] = [];

  // Propriedades calculadas uma única vez (não getters)
  metricCards: any[] = [];
  chartPoints: any[] = [];
  yGridLines: any[] = [];
  xLabels: any[] = [];
  linePath = '';
  areaPath = '';

  // Modal importar CSV
  showImportModal = false;
  importFile: File | null = null;
  importLoading = false;
  importSuccess = '';
  importError = '';

  private chartWidth     = 580;
  private chartHeight    = 135;
  private chartPadLeft   = 50;
  private chartPadRight  = 20;
  private chartPadTop    = 10;
  private chartPadBottom = 20;

  constructor(
    private dashboardService: DashboardService,
    private aiChatService: AiChatService,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.recentCharges = (data.recent_charges || []).map((c: any) => ({
        initials:    c.customer_name?.charAt(0)?.toUpperCase() || '?',
        client:      c.customer_name,
        value:       this.formatCurrency(+c.amount),
        due:         new Date(c.due_date).toLocaleDateString('pt-BR'),
        status:      c.status,
        overdueDays: this.calcOverdueDays(c.due_date),
      })).slice(0, 5);
        this.metricCards = this.buildMetricCards(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.dashboardService.getChartData().subscribe({
      next: (data: { label: string; value: number }[]) => {
        this.chartData   = data;
        this.chartPoints = this.buildChartPoints();
        this.yGridLines  = this.buildYGridLines();
        this.xLabels     = this.buildXLabels();
        this.linePath    = this.buildLinePath();
        this.areaPath    = this.buildAreaPath();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // ─── Quick Actions ────────────────────────────────────────────────────────────

  goToNewCharge(): void {
    this.router.navigate(['/charges'], { queryParams: { openModal: true } });
  }

  goToNewClient(): void {
    this.router.navigate(['/clients'], { queryParams: { openModal: true } });
  }

  goToCollectionRules(): void {
    this.router.navigate(['/collection-rules']);
  }

  goToReports(): void {
    this.router.navigate(['/reports']);
  }

  goToCharges(): void {
  this.router.navigate(['/charges']);
  }

  openImportModal(): void {
    this.importFile = null;
    this.importSuccess = '';
    this.importError = '';
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.importFile = input.files[0];
      this.importError = '';
    }
  }

  submitImport(): void {
  if (!this.importFile) {
    this.importError = 'Selecione um arquivo CSV.';
    return;
  }
  if (!this.importFile.name.endsWith('.csv')) {
    this.importError = 'Apenas arquivos .csv são aceitos.';
    return;
  }
 
  this.importLoading = true;
  this.importError   = '';
  this.importSuccess = '';
 
  const formData = new FormData();
  formData.append('file', this.importFile);
 
  this.clientService.importCsv(formData).subscribe({
    next: (result: ImportResult) => {
      this.importLoading = false;
      this.importSuccess = `${result.imported} cliente(s) importado(s) com sucesso!`;
      if (result.skipped > 0) {
        this.importSuccess += ` ${result.skipped} ignorado(s).`;
      }
      setTimeout(() => this.closeImportModal(), 2000);
    },
    error: (err) => {
      this.importLoading = false;
      this.importError = err?.error?.message || 'Erro ao importar o arquivo. Verifique o formato e tente novamente.';
    }
  });
}

  // ─── Metric cards ─────────────────────────────────────────────────────────────

  private buildMetricCards(data: DashboardMetrics): any[] {
    return [
      {
        label: 'Total Recebido',
        value: this.formatCurrency(+data.total_paid_month),
        icon: 'wallet', color: 'blue', positive: true, change: 'Este mês', sub: ''
      },
      {
        label: 'Total Pendente',
        value: this.formatCurrency(+data.total_pending),
        icon: 'alert', color: 'yellow', positive: false, change: '', sub: ''
      },
      {
        label: 'Total Vencido',
        value: this.formatCurrency(+data.total_overdue),
        icon: 'credit-card', color: 'red', positive: false,
        change: '', sub: `${data.overdue_count} cobranças`
      },
      {
        label: 'Total Cobranças',
        value: data.total_charges,
        icon: 'chart', color: 'green', positive: true,
        change: '', sub: `${data.total_clients} clientes`
      },
    ];
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────────

  sendMessage(): void {
    if (!this.chatInput.trim() || this.isTyping) return;
    const userMessage = this.chatInput.trim();
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatInput = '';
    this.isTyping = true;

    this.aiChatService.sendMessage(userMessage).subscribe({
      next: (res) => {
        this.chatMessages.push({ role: 'bot', content: res.response });
        this.isTyping = false;
      },
      error: () => {
        this.chatMessages.push({ role: 'bot', content: 'Erro ao processar sua pergunta. Tente novamente.' });
        this.isTyping = false;
      }
    });
  }

  askSuggestion(question: string): void {
    this.chatInput = question;
    this.sendMessage();
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private calcOverdueDays(dueDate: string): number {
    const diff = Date.now() - new Date(dueDate).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  }

  formatCurrency(val: number): string {
    if (!val || isNaN(val)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      paid: 'status-pago', pending: 'status-pendente', overdue: 'status-vencido'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      paid: 'Pago', pending: 'Pendente', overdue: 'Vencido'
    };
    return map[status] || status;
  }

  // ─── Chart builders ───────────────────────────────────────────────────────────

  private get chartInnerW(): number { return this.chartWidth - this.chartPadLeft - this.chartPadRight; }
  private get chartInnerH(): number { return this.chartHeight - this.chartPadTop - this.chartPadBottom; }

  private get niceMaxVal(): number {
    const raw = Math.max(...this.chartData.map(d => d.value), 1);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    if (n <= 1) return mag;
    if (n <= 2) return 2 * mag;
    if (n <= 5) return 5 * mag;
    return 10 * mag;
  }

  private fmtShort(val: number): string {
    if (val === 0) return 'R$ 0';
    return 'R$ ' + Math.round(val).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private fmtDecimal(val: number): string {
    const p = val.toFixed(2).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'R$ ' + p.join(',');
  }

  private pointX(i: number): number {
    if (this.chartData.length <= 1) return this.chartPadLeft;
    return this.chartPadLeft + (i / (this.chartData.length - 1)) * this.chartInnerW;
  }

  private pointY(value: number): number {
    return this.chartPadTop + this.chartInnerH - (value / this.niceMaxVal) * this.chartInnerH;
  }

  private buildChartPoints(): any[] {
    return this.chartData
      .map((d, i) => ({
        cx: +this.pointX(i).toFixed(1),
        cy: +this.pointY(d.value).toFixed(1),
        label: d.label,
        displayValue: this.fmtDecimal(d.value),
        value: d.value
      }))
      .filter(p => p.value > 0);
  }

  private buildYGridLines(): any[] {
    const lines = 5;
    const interval = this.niceMaxVal / lines;
    return Array.from({ length: lines + 1 }, (_, i) => {
      const val = interval * i;
      return { value: this.fmtShort(val), y: +this.pointY(val).toFixed(1) };
    });
  }

  private buildXLabels(): any[] {
    return this.chartData
      .map((d, i) => ({ label: d.label, x: +this.pointX(i).toFixed(1), i }))
      .filter(xl => xl.i % 5 === 0 || xl.i === this.chartData.length - 1);
  }

  private buildLinePath(): string {
    if (this.chartData.length === 0) return '';
    return this.chartData.map((d, i) =>
      `${i === 0 ? 'M' : 'L'}${this.pointX(i).toFixed(1)},${this.pointY(d.value).toFixed(1)}`
    ).join(' ');
  }

  private buildAreaPath(): string {
    if (this.chartData.length === 0) return '';
    const last  = this.chartData.length - 1;
    const baseY = (this.chartPadTop + this.chartInnerH).toFixed(1);
    return `${this.buildLinePath()} L${this.pointX(last).toFixed(1)},${baseY} L${this.pointX(0).toFixed(1)},${baseY} Z`;
  }
}