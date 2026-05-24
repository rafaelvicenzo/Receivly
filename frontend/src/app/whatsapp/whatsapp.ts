import {
  Component, OnInit, OnDestroy, AfterViewChecked,
  ViewChild, ElementRef, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  WhatsappSocketService,
  ChatContact,
  ChatMessage,
  WaStatus,
} from '../services/whatsapp-socket.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp.html',
  styleUrl: './whatsapp.scss',
})
export class Whatsapp implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesEl') messagesEl!: ElementRef<HTMLDivElement>;

  status$!:    BehaviorSubject<WaStatus>;
  contacts$!:  BehaviorSubject<ChatContact[]>;
  messages$!:  BehaviorSubject<ChatMessage[]>;
  activeJid$!: BehaviorSubject<string | null>;

  activeContact: ChatContact | null = null;
  searchQuery = '';
  filter: 'all' | 'attending' | 'new' = 'all';
  draft = '';

  private needsScroll = false;
  private subs = new Subscription();

  constructor(private ws: WhatsappSocketService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.status$   = this.ws.status$;
    this.contacts$ = this.ws.contacts$;
    this.messages$ = this.ws.messages$;
    this.activeJid$ = this.ws.activeJid$;

    this.subs.add(
      this.ws.activeJid$.subscribe(jid => {
        this.activeContact = jid
          ? (this.ws.contacts$.getValue().find(c => c.jid === jid) ?? null)
          : null;
      })
    );
    this.subs.add(
      this.ws.messages$.subscribe(() => {
        this.needsScroll = true;
        this.cdr.detectChanges();
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.needsScroll) {
      this.scrollBottom();
      this.needsScroll = false;
    }
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  get filteredContacts(): ChatContact[] {
    let list = this.ws.contacts$.getValue();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }
    if (this.filter === 'new')       list = list.filter(c => c.unreadCount > 0);
    if (this.filter === 'attending') list = list.filter(c => c.unreadCount === 0);
    return list;
  }

  connect()    { this.ws.connectWhatsapp(); }
  disconnect() {
    if (!confirm('Deseja desconectar o WhatsApp?')) return;
    this.ws.disconnectWhatsapp();
    this.activeContact = null;
  }

  openChat(contact: ChatContact): void {
    this.activeContact = contact;
    this.ws.openChat(contact.jid);
  }

  send(): void {
    const text = this.draft.trim();
    if (!text || !this.activeContact) return;
    this.ws.sendMessage(this.activeContact.jid, text);
    this.draft = '';
  }

  onEnter(e: KeyboardEvent): void {
    if (!e.shiftKey) { e.preventDefault(); this.send(); }
  }

  applyShortcut(type: 'cobranca' | 'boleto' | 'pix'): void {
    const nome = this.activeContact?.name.split(' ')[0] ?? 'cliente';
    const templates: Record<string, string> = {
      cobranca: `Olá ${nome}! Passando para lembrar que você tem uma cobrança em aberto. Podemos resolver? 😊`,
      boleto:   `Olá ${nome}! Segue o link do boleto para pagamento. Qualquer dúvida, estou à disposição! 📄`,
      pix:      `Olá ${nome}! Para facilitar, você pode pagar via Pix. Vou te enviar os dados agora! ⚡`,
    };
    this.draft = templates[type];
  }

  initial(name: string): string {
    return name?.charAt(0).toUpperCase() ?? '?';
  }

  relativeTime(ts: number): string {
    if (!ts) return '';
    const date = new Date(ts);
    const now  = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (days === 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Ontem';
    if (days < 7)  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  msgTime(ts: number): string {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  dateLabel(ts: number): string {
    const d    = new Date(ts);
    const now  = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  showDateSep(i: number): boolean {
    const msgs = this.ws.messages$.getValue();
    if (i === 0) return true;
    return new Date(msgs[i].timestamp).toDateString() !==
           new Date(msgs[i - 1].timestamp).toDateString();
  }

  private scrollBottom(): void {
    const el = this.messagesEl?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}