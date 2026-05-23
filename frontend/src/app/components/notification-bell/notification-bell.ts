import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, AppNotification } from '../../services/notification-bell';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule]
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  notifications: AppNotification[] = [];
  currentTab: 'all' | 'unread' | 'cobrancas' = 'all';
  isOpen = false;
  loading = false;

  private pollSub?: Subscription;

  constructor(
    private notifService: NotificationService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();

    // Polling a cada 30 segundos para novas notificações
    this.pollSub = interval(30000)
      .pipe(switchMap(() => this.notifService.getAll()))
      .subscribe(data => this.notifications = data);
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // Fecha o dropdown ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.fetchNotifications();
    }
  }

  fetchNotifications(): void {
    this.loading = true;
    this.notifService.getAll().subscribe({
      next: (data: AppNotification[]) => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get visibleNotifications(): AppNotification[] {
    if (this.currentTab === 'unread') return this.notifications.filter(n => !n.read_at);
    if (this.currentTab === 'cobrancas') return this.notifications.filter(n => n.type === 'cobranca');
    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read_at).length;
  }

  get hasUnread(): boolean {
    return this.unreadCount > 0;
  }

  setTab(tab: 'all' | 'unread' | 'cobrancas'): void {
    this.currentTab = tab;
  }

  markAsRead(notification: AppNotification): void {
    if (notification.read_at) return;
    this.notifService.markAsRead(notification.id).subscribe(() => {
      notification.read_at = new Date().toISOString();
    });
  }

  markAllAsRead(): void {
    this.notifService.markAllAsRead().subscribe(() => {
      this.notifications.forEach(n => n.read_at = new Date().toISOString());
    });
  }

  iconClass(type: string): string {
    const map: Record<string, string> = {
      cobranca: 'icon-cobranca danger',
      pagamento: 'icon-pagamento success',
      lembrete: 'icon-lembrete warning',
      sistema: 'icon-sistema info',
    };
    return map[type] ?? 'icon-default info';
  }
}