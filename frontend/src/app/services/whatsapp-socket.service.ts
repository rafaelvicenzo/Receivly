import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ChatContact {
  jid: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  jid: string;
  fromMe: boolean;
  body: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read' | 'error';
}

export interface WaStatus {
  connected: boolean;
  qr: string | null;
}

@Injectable({ providedIn: 'root' })
export class WhatsappSocketService implements OnDestroy {
  private socket: Socket;

  status$    = new BehaviorSubject<WaStatus>({ connected: false, qr: null });
  contacts$  = new BehaviorSubject<ChatContact[]>([]);
  messages$  = new BehaviorSubject<ChatMessage[]>([]);
  activeJid$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    this.socket.on('wa:status',   (s: WaStatus)       => this.status$.next(s));
    this.socket.on('wa:qr',       (p: { qr: string }) => this.status$.next({ connected: false, qr: p.qr }));
    this.socket.on('wa:contacts', (c: ChatContact[])   => this.contacts$.next(c));

    this.socket.on('wa:message', (msg: ChatMessage) => {
      if (msg.jid === this.activeJid$.getValue()) {
        this.messages$.next([...this.messages$.getValue(), msg]);
      }
      const updated = this.contacts$.getValue()
        .map(c => c.jid === msg.jid
          ? { ...c, lastMessage: msg.body, lastMessageTime: msg.timestamp,
              unreadCount: msg.fromMe ? c.unreadCount : c.unreadCount + 1 }
          : c
        ).sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      this.contacts$.next(updated);
    });

    this.socket.on('wa:message:status', (u: { id: string; status: string }) => {
      this.messages$.next(
        this.messages$.getValue().map(m =>
          m.id === u.id ? { ...m, status: u.status as ChatMessage['status'] } : m
        )
      );
    });
  }

  connectWhatsapp()    { this.socket.emit('wa:connect'); }
  disconnectWhatsapp() { this.socket.emit('wa:disconnect'); }

  openChat(jid: string): void {
    this.activeJid$.next(jid);
    this.messages$.next([]);
    this.socket.emit('wa:messages', { jid }, (msgs: ChatMessage[]) => {
      this.messages$.next(msgs ?? []);
    });
    this.contacts$.next(
      this.contacts$.getValue().map(c => c.jid === jid ? { ...c, unreadCount: 0 } : c)
    );
  }

  sendMessage(jid: string, text: string): void {
    const temp: ChatMessage = {
      id: `tmp_${Date.now()}`,
      jid, fromMe: true, body: text,
      timestamp: Date.now(), status: 'sent',
    };
    this.messages$.next([...this.messages$.getValue(), temp]);
    this.socket.emit('wa:send', { jid, text });
  }

  ngOnDestroy() { this.socket.disconnect(); }
}