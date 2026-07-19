import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChartConfiguration, ScriptableContext } from 'chart.js';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PedidosService } from '../../../core/services/pedidos.service';
import { ProductosService } from '../../../core/services/productos.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { EstadisticasVentas, Producto, ProductoMasVendido } from '../../../core/models';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { ChartComponent } from '../../../shared/components/chart/chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyCopPipe, ChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private dashboardSvc = inject(DashboardService);
  private pedidosSvc = inject(PedidosService);
  private productosSvc = inject(ProductosService);
  private ws = inject(WebsocketService);
  private destroyRef = inject(DestroyRef);

  protected isLoading = signal(true);

  // KPIs
  protected ventasTotales = signal(0);
  protected whatsappActivos = signal(0);
  protected alertasStock = signal(0);

  // Low stock table
  protected lowStock = signal<Producto[]>([]);

  // Charts
  protected areaConfig = signal<ChartConfiguration | null>(null);
  protected barConfig = signal<ChartConfiguration | null>(null);

  ngOnInit(): void {
    this.load();

    // Live: a new WhatsApp order bumps the active counter in real time.
    this.ws.pedidoEntrante$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((pedido) => {
      if (pedido?.canal === 'whatsapp') {
        this.whatsappActivos.update((n) => n + 1);
      }
    });
  }

  private load(): void {
    this.isLoading.set(true);

    forkJoin({
      estadisticas: this.dashboardSvc.getEstadisticas('dia'),
      topProductos: this.dashboardSvc.getProductosMasVendidos(),
      productos: this.productosSvc.getProductos(),
      whatsapp: this.pedidosSvc.getPedidos({ canal: 'whatsapp', estado: 'pendiente' }),
    }).subscribe({
      next: ({ estadisticas, topProductos, productos, whatsapp }) => {
        this.ventasTotales.set(estadisticas?.ventas_totales ?? 0);
        this.whatsappActivos.set(whatsapp?.length ?? 0);

        const criticos = (productos ?? []).filter((p) => p.stock_actual < p.stock_minimo);
        this.alertasStock.set(criticos.length);
        this.lowStock.set(criticos);

        this.areaConfig.set(this.buildAreaConfig(estadisticas));
        this.barConfig.set(this.buildBarConfig(topProductos ?? []));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  protected deficit(p: Producto): number {
    return Math.max(0, p.stock_minimo - p.stock_actual);
  }

  protected categoriaLabel(p: Producto): string {
    if (!p.categoria) return '—';
    return typeof p.categoria === 'string' ? p.categoria : p.categoria.nombre;
  }

  // ---------- Chart builders ----------

  private buildAreaConfig(est: EstadisticasVentas): ChartConfiguration {
    const serie = est?.serie ?? est?.ventas ?? [];
    const labels = serie.map((s) => s.fecha);
    const data = serie.map((s) => s.total);

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#8a6aec',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#8a6aec',
            backgroundColor: (ctx: ScriptableContext<'line'>) => {
              const { chart } = ctx;
              const { ctx: c, chartArea } = chart;
              if (!chartArea) return 'rgba(109,79,214,0.15)';
              const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(109,79,214,0.35)');
              gradient.addColorStop(1, 'rgba(109,79,214,0)');
              return gradient;
            },
          },
        ],
      },
      options: this.commonOptions(),
    };
  }

  private buildBarConfig(top: ProductoMasVendido[]): ChartConfiguration {
    const labels = top.map((t) => t.nombre);
    const data = top.map((t) => t.cantidad_vendida ?? t.total_vendido ?? t.cantidad ?? 0);
    const colors = data.map((_, i) => (i === 0 ? '#a68af5' : '#6d4fd6'));

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderRadius: 6,
            barThickness: 18,
          },
        ],
      },
      options: {
        ...this.commonOptions(),
        indexAxis: 'y',
      },
    };
  }

  private commonOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f141d',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 } },
          border: { display: false },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 } },
          border: { display: false },
        },
      },
    };
  }
}
