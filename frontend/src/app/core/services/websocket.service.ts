import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Pedido } from '../models';

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private socket?: Socket;
  private pedidoEntranteSubject = new Subject<Pedido>();

  /** Emits every 'pedido_entrante' event pushed by the backend. */
  readonly pedidoEntrante$: Observable<Pedido> = this.pedidoEntranteSubject.asObservable();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('pedido_entrante', (pedido: Pedido) => {
      this.pedidoEntranteSubject.next(pedido);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
