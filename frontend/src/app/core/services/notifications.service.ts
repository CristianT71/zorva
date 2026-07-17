import { Injectable, inject, signal } from '@angular/core';
import { WebsocketService } from './websocket.service';

/**
 * Tracks unread incoming orders so the sidebar can pulse the "Orders Hub"
 * item. Connects the socket once and lives for the app lifetime.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private ws = inject(WebsocketService);

  readonly unreadOrders = signal(0);
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.ws.connect();
    this.ws.pedidoEntrante$.subscribe(() => {
      this.unreadOrders.update((n) => n + 1);
    });
  }

  clearOrders(): void {
    this.unreadOrders.set(0);
  }
}
