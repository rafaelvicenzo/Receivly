import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, DashboardMetrics } from '../services/dashboard';
import { AiChatService } from '../services/ai-chat';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  metrics!: DashboardMetrics;
  isLoading = true;
  chatMessages: { role: string; content: string }[] = [];
  chatInput = '';
  isTyping = false;

  constructor(
    private dashboardService: DashboardService,
    private aiChatService: AiChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  sendMessage(): void {
  if (!this.chatInput.trim() || this.isTyping) return;

  const userMessage = this.chatInput.trim();
  this.chatMessages.push({ role: 'user', content: userMessage });
  this.chatInput = '';
  this.isTyping = true;
  this.cdr.detectChanges();

  this.aiChatService.sendMessage(userMessage).subscribe({
    next: (res) => {
      this.chatMessages.push({ role: 'bot', content: res.response });
      this.isTyping = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.chatMessages.push({ role: 'bot', content: 'Erro ao processar sua pergunta. Tente novamente.' });
      this.isTyping = false;
      this.cdr.detectChanges();
    }
  });
}

  askSuggestion(question: string): void {
    this.chatInput = question;
    this.sendMessage();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      paid: 'status-pago',
      pending: 'status-pendente',
      overdue: 'status-vencido'
    };
    return map[status] || '';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Vencido'
    };
    return map[status] || status;
  }
}