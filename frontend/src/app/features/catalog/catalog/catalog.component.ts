import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { ProductosService } from '../../../core/services/productos.service';
import { ToastService } from '../../../core/services/toast.service';
import { Categoria, Producto } from '../../../core/models';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { ProductModalComponent } from '../product-modal/product-modal.component';

type StockLevel = 'ok' | 'low' | 'out';

@Component({
  selector: 'app-catalog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyCopPipe, ProductModalComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit {
  private productosSvc = inject(ProductosService);
  private toast = inject(ToastService);

  protected isLoading = signal(true);
  protected productos = signal<Producto[]>([]);
  protected categorias = signal<Categoria[]>([]);

  // Debounced search term (300ms) — filtering happens on the frontend.
  private search$ = new Subject<string>();
  private searchTerm = toSignal(
    this.search$.pipe(debounceTime(300), distinctUntilChanged(), startWith('')),
    { initialValue: '' },
  );

  protected filtered = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.productos();
    return this.productos().filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        this.categoriaLabel(p).toLowerCase().includes(term),
    );
  });

  // Modal state
  protected modalOpen = signal(false);
  protected editing = signal<Producto | null>(null);

  // Inline delete confirmation — holds the id awaiting confirmation.
  protected confirmingDelete = signal<number | null>(null);

  ngOnInit(): void {
    this.loadProductos();
    this.productosSvc.getCategorias().subscribe({
      next: (cats) => this.categorias.set(cats ?? []),
      error: () => {},
    });
  }

  private loadProductos(): void {
    this.isLoading.set(true);
    this.productosSvc.getProductos().subscribe({
      next: (list) => {
        this.productos.set((list ?? []).filter((p) => p.activo !== false));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  protected onSearch(event: Event): void {
    this.search$.next((event.target as HTMLInputElement).value);
  }

  // ---------- Stock pill ----------
  protected stockLevel(p: Producto): StockLevel {
    if (p.stock_actual === 0) return 'out';
    if (p.stock_actual < p.stock_minimo) return 'low';
    return 'ok';
  }

  protected categoriaLabel(p: Producto): string {
    if (!p.categoria) {
      const cat = this.categorias().find((c) => c.id === p.categoria_id);
      return cat?.nombre ?? '—';
    }
    return typeof p.categoria === 'string' ? p.categoria : p.categoria.nombre;
  }

  // ---------- Modal ----------
  openCreate(): void {
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(p: Producto): void {
    this.editing.set(p);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSaved(product: Producto): void {
    const list = this.productos();
    const idx = list.findIndex((p) => p.id === product.id);
    // Update in place on edit, prepend on create — no full reload.
    if (idx >= 0) {
      const next = [...list];
      next[idx] = { ...next[idx], ...product };
      this.productos.set(next);
    } else {
      this.productos.set([product, ...list]);
    }
    this.closeModal();
  }

  // ---------- Delete ----------
  askDelete(id: number): void {
    this.confirmingDelete.set(id);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(null);
  }

  confirmDelete(p: Producto): void {
    this.productosSvc.deleteProducto(p.id).subscribe({
      next: () => {
        this.productos.set(this.productos().filter((x) => x.id !== p.id));
        this.confirmingDelete.set(null);
        this.toast.success('Producto eliminado');
      },
      error: () => this.confirmingDelete.set(null),
    });
  }
}
