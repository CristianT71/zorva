export type PeriodoEstadisticas = 'dia' | 'semana' | 'mes';

export interface PuntoHistorico {
  fecha: string;
  total: number;
}

export interface EstadisticasResult {
  ventasTotales: number;
  historicoGrafica: PuntoHistorico[];
}

export interface TopProducto {
  productoId: string;
  nombre: string;
  cantidadVendida: number;
}

export interface ResumenDiario {
  fecha: string;
  totalVentasDia: number;
  pedidosTotales: number;
  pedidosPorCanal: { whatsapp: number; web: number };
  productoEstrella: string | null;
}

export interface IDashboardRepository {
  getEstadisticas(periodo: PeriodoEstadisticas): Promise<EstadisticasResult>;
  getTopProductos(): Promise<TopProducto[]>;
  getResumenDiario(): Promise<ResumenDiario>;
}

export const DASHBOARD_REPOSITORY = Symbol('IDashboardRepository');
