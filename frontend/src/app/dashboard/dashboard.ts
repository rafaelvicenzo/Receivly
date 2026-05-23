import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {

  userName = 'Rafael';

  metrics = [
    {
      label: 'Total a Receber',
      value: 'R$ 0,00',
      change: '0%',
      positive: true,
      icon: 'wallet',
      color: 'green',
      sub: 'em cobranças pendentes'
    },
    {
      label: 'Cobranças Vencidas',
      value: 'R$ 19,00',
      change: '3 em atraso',
      positive: false,
      icon: 'alert',
      color: 'red',
      sub: '3 em atraso'
    },
    {
      label: 'Recebido no Mês',
      value: 'R$ 500,00',
      change: '',
      positive: true,
      icon: 'credit-card',
      color: 'blue',
      sub: 'pagamentos confirmados'
    },
    {
      label: 'Taxa de Inadimplência',
      value: '75%',
      change: '',
      positive: true,
      icon: 'chart',
      color: 'amber',
      sub: '2 clientes cadastrados'
    }
  ];

  get recentCharges() {
    const data = [
      { client: 'Esse nunca paga', initials: 'EN', value: 'R$ 0,00', due: '15/05/2026', status: 'vencido' },
      { client: 'TESTE DA SINCERIDADE', initials: 'TS', value: 'R$ 19,00', due: '15/05/2026', status: 'vencido' },
      { client: 'Teste Final', initials: 'TF', value: 'R$ 500,00', due: '20/05/2026', status: 'pago' },
      { client: 'Teste Asaas', initials: 'TA', value: 'R$ 500,00', due: '20/05/2026', status: 'pago' },
      { client: 'Empresa Exemplo Ltda', initials: 'EE', value: 'R$ 50.000,00', due: '20/05/2026', status: 'pago' }
    ];
    return data.map(c => ({ ...c, overdueDays: this.calcOverdue(c.due) }));
  }

  private calcOverdue(due: string): number {
    const [day, month, year] = due.split('/').map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = today.getTime() - dueDate.getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  private chartWidth = 580;
  private chartHeight = 135;
  private chartPadLeft = 50;
  private chartPadRight = 20;
  private chartPadTop = 20;
  private chartPadBottom = 30;

  chartData = [
    { label: '01 Mai', value: 0 },
    { label: '05 Mai', value: 120 },
    { label: '10 Mai', value: 350 },
    { label: '15 Mai', value: 200 },
    { label: '20 Mai', value: 480 },
    { label: '25 Mai', value: 380 },
    { label: '30 Mai', value: 500 }
  ];

  private get chartInnerW(): number {
    return this.chartWidth - this.chartPadLeft - this.chartPadRight;
  }

  private get chartInnerH(): number {
    return this.chartHeight - this.chartPadTop - this.chartPadBottom;
  }

  private get niceMaxVal(): number {
    const raw = Math.max(...this.chartData.map(d => d.value), 1);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    if (n <= 1) return mag;
    if (n <= 2) return 2 * mag;
    if (n <= 5) return 5 * mag;
    return 10 * mag;
  }

  private formatCurrency(val: number): string {
    if (val === 0) return 'R$ 0';
    const int = Math.round(val);
    return 'R$ ' + int.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  private fmtDecimal(val: number): string {
    const p = val.toFixed(2).split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'R$ ' + p.join(',');
  }

  private pointX(i: number): number {
    return this.chartPadLeft + (i / (this.chartData.length - 1)) * this.chartInnerW;
  }

  private pointY(value: number): number {
    return this.chartPadTop + this.chartInnerH - ((value - 0) / this.niceMaxVal) * this.chartInnerH;
  }

  get chartPoints() {
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

  get yGridLines() {
    const lines = 5;
    const interval = this.niceMaxVal / lines;
    return Array.from({ length: lines + 1 }, (_, i) => {
      const val = interval * i;
      return { value: this.formatCurrency(val), y: +this.pointY(val).toFixed(1) };
    });
  }

  get xLabels() {
    return this.chartData.map((d, i) => ({
      label: d.label,
      x: +this.pointX(i).toFixed(1)
    }));
  }

  get linePath(): string {
    return this.chartData
      .map((d, i) => {
        const x = this.pointX(i);
        const y = this.pointY(d.value);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }

  get areaPath(): string {
    const last = this.chartData.length - 1;
    const baseY = this.chartPadTop + this.chartInnerH;
    return this.linePath + ` L${this.pointX(last).toFixed(1)},${baseY.toFixed(1)} L${this.pointX(0).toFixed(1)},${baseY.toFixed(1)} Z`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pago: 'status-pago',
      vencido: 'status-vencido'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pago: 'Pago',
      vencido: 'Vencido'
    };
    return map[status] || status;
  }

}
