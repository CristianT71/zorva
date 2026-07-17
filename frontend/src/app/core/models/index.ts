/* ============================================================
   Domain models shared across services and components.
   Fields marked optional tolerate variations in the backend
   payload so the UI degrades gracefully rather than crashing.
   ============================================================ */

export interface User {
  id?: number | string;
  nombre?: string;
  email: string;
  rol?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria_id?: number;
  categoria?: string | Categoria;
  precio: number;
  unidad_medida?: string;
  stock_actual: number;
  stock_minimo: number;
  activo?: boolean;
}

export type EstadoPedido =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'despachado'
  | 'entregado'
  | 'cancelado';

export type CanalPedido = 'whatsapp' | 'web' | string;

export interface Pedido {
  id: number;
  canal: CanalPedido;
  cliente?: string;
  cliente_nombre?: string;
  total: number;
  estado: EstadoPedido;
  created_at?: string;
  hora?: string;
}

export interface EstadisticasVentas {
  ventas_totales: number;
  serie?: { fecha: string; total: number }[];
  // tolerate alternative key names from the backend
  ventas?: { fecha: string; total: number }[];
}

export interface ProductoMasVendido {
  id?: number;
  nombre: string;
  cantidad_vendida?: number;
  total_vendido?: number;
  cantidad?: number;
}

export interface AiResponse {
  respuesta?: string;
  response?: string;
  message?: string;
  data?: unknown;
}
