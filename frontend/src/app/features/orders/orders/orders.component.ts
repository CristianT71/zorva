import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PedidosService } from '../../../core/services/pedidos.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { NotificationsService } from '../../../core/services/notifications.service';
import { ToastService } from '../../../core/services/toast.service';
import { EstadoPedido, Pedido } from '../../../core/models';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { StatusDropdownComponent } from '../status-dropdown/status-dropdown.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyCopPipe, StatusDropdownComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  private pedidosSvc = inject(PedidosService);
  private ws = inject(WebsocketService);
  private notifications = inject(NotificationsService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  protected isLoading = signal(true);
  protected pedidos = signal<Pedido[]>([]);
  // Tracks rows that just arrived over the socket, so we can animate them.
  protected freshIds = signal<Set<number>>(new Set());

  protected whatsappPendientes = computed(
    () => this.pedidos().filter((p) => p.canal === 'whatsapp' && p.estado === 'pendiente').length,
  );

  ngOnInit(): void {
    // Viewing the hub clears the sidebar's unread pulse.
    this.notifications.clearOrders();
    this.load();

    this.ws.pedidoEntrante$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pedido) => {
      this.prependOrder(pedido);
    });
  }

  private load(): void {
    this.isLoading.set(true);
    this.pedidosSvc.getPedidos().subscribe({
      next: (list) => {
        this.pedidos.set(list ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private prependOrder(pedido: Pedido): void {
    this.pedidos.set([pedido, ...this.pedidos()]);
    this.freshIds.update((set) => new Set(set).add(pedido.id));
    this.notifications.clearOrders(); // already on the hub — keep it read
    this.toast.show(`Nuevo pedido #${pedido.id} recibido`, 'amber');
  }

  protected isFresh(id: number): boolean {
    return this.freshIds().has(id);
  }

  protected clienteLabel(p: Pedido): string {
    return p.cliente || p.cliente_nombre || 'Cliente';
  }

  protected hora(p: Pedido): string {
    if (p.hora) return p.hora;
    if (p.created_at) {
      const d = new Date(p.created_at);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      }
    }
    return '—';
  }

  onEstadoChange(pedido: Pedido, estado: EstadoPedido): void {
    const previous = pedido.estado;
    // Optimistic update — revert on failure.
    this.patchLocal(pedido.id, estado);

    this.pedidosSvc.updateEstado(pedido.id, estado).subscribe({
      next: () => this.toast.success(`Pedido #${pedido.id} → ${estado}`),
      error: () => {
        this.patchLocal(pedido.id, previous);
        this.toast.error('No se pudo actualizar el estado');
      },
    });
  }

  private patchLocal(id: number, estado: EstadoPedido): void {
    this.pedidos.set(
      this.pedidos().map((p) => (p.id === id ? { ...p, estado } : p)),
    );
  }
}
