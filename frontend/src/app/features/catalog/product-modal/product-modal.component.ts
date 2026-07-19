import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService } from '../../../core/services/productos.service';
import { ToastService } from '../../../core/services/toast.service';
import { Categoria, Producto } from '../../../core/models';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss',
})
export class ProductModalComponent {
  private fb = inject(FormBuilder);
  private productosSvc = inject(ProductosService);
  private toast = inject(ToastService);

  /** When set, the modal is in edit mode; otherwise create mode. */
  producto = input<Producto | null>(null);
  categorias = input<Categoria[]>([]);

  saved = output<Producto>();
  closed = output<void>();

  protected saving = signal(false);
  protected isEdit = computed(() => !!this.producto());

  protected form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    categoria_id: [null as number | null, [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    unidad_medida: ['', [Validators.required]],
    stock_actual: [0, [Validators.required, Validators.min(0)]],
    stock_minimo: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    // Prefill in edit mode once the input is available.
    const p = this.producto();
    if (p) {
      this.form.patchValue({
        nombre: p.nombre,
        categoria_id: p.categoria_id ?? null,
        precio: p.precio,
        unidad_medida: p.unidad_medida ?? '',
        stock_actual: p.stock_actual,
        stock_minimo: p.stock_minimo,
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload = { ...raw, categoria_id: raw.categoria_id ?? undefined };
    const existing = this.producto();
    const req$ = existing
      ? this.productosSvc.updateProducto(existing.id, payload)
      : this.productosSvc.createProducto(payload);

    req$.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.toast.success(existing ? 'Producto actualizado' : 'Producto creado');
        // Fall back to a merged object if the API returns nothing useful.
        this.saved.emit(result ?? ({ ...existing, ...payload } as Producto));
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.closed.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
