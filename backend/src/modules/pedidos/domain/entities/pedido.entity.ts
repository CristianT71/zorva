import { EstadoPedido } from '../value-objects/estado-pedido.vo';
import { Cliente } from './cliente.entity';
import { PedidoItem } from './pedido-item.entity';

export type CanalOrigen = 'whatsapp' | 'web';

export class Pedido {
  constructor(
    public readonly id: string,
    public readonly canalOrigen: CanalOrigen,
    public estado: EstadoPedido,
    public readonly total: number,
    public readonly createdAt: Date,
    public readonly cliente: Cliente,
    public readonly items: PedidoItem[],
  ) {}
}
