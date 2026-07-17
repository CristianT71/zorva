import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EstadoPedido } from '../../../core/models';

interface StatusMeta {
  label: string;
  color: string;
}

const STATUS_MAP: Record<string, StatusMeta> = {
  pendiente: { label: 'Pendiente', color: '#f59e0b' },
  confirmado: { label: 'Confirmado', color: '#3b82f6' },
  en_preparacion: { label: 'En Preparación', color: '#8b5cf6' },
  despachado: { label: 'Despachado', color: '#06b6d4' },
  entregado: { label: 'Entregado', color: '#10b981' },
  cancelado: { label: 'Cancelado', color: '#ef4444' },
};

/** Read-only coloured pill for an order status. */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="pill"
      [style.color]="meta().color"
      [style.background]="meta().color + '1f'"
      [style.border-color]="meta().color + '55'"
    >
      {{ meta().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  estado = input.required<EstadoPedido | string>();

  protected meta = computed<StatusMeta>(
    () => STATUS_MAP[this.estado()] ?? { label: this.estado(), color: '#9ca3af' },
  );
}
