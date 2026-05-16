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

  metrics = [
    {
      label: 'Total a Receber',
      value: 'R$ 48.320,00',
      change: '+12,4%',
      positive: true,
      icon: 'trending-up',
      color: 'green',
      sub: 'em cobranças ativas'
    },
    {
      label: 'Cobranças Vencidas',
      value: 'R$ 8.750,00',
      change: '-3,2%',
      positive: false,
      icon: 'alert-circle',
      color: 'red',
      sub: '14 cobranças em atraso'
    },
    {
      label: 'Recebido no Mês',
      value: 'R$ 21.490,00',
      change: '+8,1%',
      positive: true,
      icon: 'check-circle',
      color: 'blue',
      sub: 'de R$ 27.000 esperados'
    },
    {
      label: 'Taxa de Inadimplência',
      value: '6,3%',
      change: '-1,1%',
      positive: true,
      icon: 'chart-pie',
      color: 'amber',
      sub: 'abaixo da média do setor'
    }
  ];

  recentCharges = [
    { client: 'Empresa Alpha Ltda', value: 'R$ 3.200,00', due: '15/05/2026', status: 'pago' },
    { client: 'Beta Comércio S.A.', value: 'R$ 1.850,00', due: '18/05/2026', status: 'pendente' },
    { client: 'Gama Serviços ME', value: 'R$ 720,00', due: '10/05/2026', status: 'vencido' },
    { client: 'Delta Indústria', value: 'R$ 5.400,00', due: '20/05/2026', status: 'pendente' },
    { client: 'Epsilon Tech', value: 'R$ 980,00', due: '08/05/2026', status: 'vencido' },
  ];

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pago: 'status-pago',
      pendente: 'status-pendente',
      vencido: 'status-vencido'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pago: 'Pago',
      pendente: 'Pendente',
      vencido: 'Vencido'
    };
    return map[status] || status;
  }
}