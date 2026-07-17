import { EstadoPedido } from '../value-objects/estado-pedido.vo';
import { Pedido } from '../entities/pedido.entity';

export interface PedidoFilters {
  canal?: string;
  estado?: string;
  fecha?: string;
}

export interface IPedidoRepository {
  create(pedido: Pedido): Promise<Pedido>;
  findAll(filters: PedidoFilters): Promise<Pedido[]>;
  findById(id: string): Promise<Pedido | null>;
  updateEstado(id: string, estado: EstadoPedido): Promise<Pedido>;
  findUltimoPorWhatsapp(numeroWhatsapp: string): Promise<Pedido | null>;
}

export const PEDIDO_REPOSITORY = Symbol('IPedidoRepository');
