import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { EstadoPedido } from '../../../core/models';

interface Option {
  value: EstadoPedido;
  label: string;
  color: string;
}

const OPTIONS: Option[] = [
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'confirmado', label: 'Confirmado', color: '#3b82f6' },
  { value: 'en_preparacion', label: 'En Preparación', color: '#8b5cf6' },
  { value: 'despachado', label: 'Despachado', color: '#06b6d4' },
  { value: 'entregado', label: 'Entregado', color: '#10b981' },
  { value: 'cancelado', label: 'Cancelado', color: '#ef4444' },
];

@Component({
  selector: 'app-status-dropdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-dropdown.component.html',
  styleUrl: './status-dropdown.component.scss',
})
export class StatusDropdownComponent {
  private host = inject(ElementRef);

  estado = input.required<EstadoPedido>();
  changed = output<EstadoPedido>();

  protected open = signal(false);
  protected readonly options = OPTIONS;

  protected current = computed(
    () => OPTIONS.find((o) => o.value === this.estado()) ?? OPTIONS[0],
  );

  toggle(): void {
    this.open.update((v) => !v);
  }

  select(value: EstadoPedido): void {
    this.open.set(false);
    if (value !== this.estado()) this.changed.emit(value);
  }

  // Close the floating menu when clicking anywhere outside this component.
  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }
}
