import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../../productos/domain/ports/producto.repository.port';
import { Producto } from '../../../productos/domain/entities/producto.entity';
import { PedidosGateway } from '../../../websocket/pedidos.gateway';
import { Cliente } from '../../domain/entities/cliente.entity';
import { PedidoItem } from '../../domain/entities/pedido-item.entity';
import { type CanalOrigen, Pedido } from '../../domain/entities/pedido.entity';
import {
  CLIENTE_REPOSITORY,
  type IClienteRepository,
} from '../../domain/ports/cliente.repository.port';
import {
  type IPedidoRepository,
  PEDIDO_REPOSITORY,
} from '../../domain/ports/pedido.repository.port';
import { EstadoPedido } from '../../domain/value-objects/estado-pedido.vo';

export interface CreatePedidoItemInput {
  producto_id: string;
  cantidad: number;
}

export interface CreatePedidoInput {
  canal_origen: CanalOrigen;
  cliente_whatsapp?: { numero_whatsapp: string; nombre: string };
  items: CreatePedidoItemInput[];
}

@Injectable()
export class CreatePedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
    @Inject(CLIENTE_REPOSITORY)
    private readonly clienteRepository: IClienteRepository,
    private readonly pedidosGateway: PedidosGateway,
  ) {}

  async execute(input: CreatePedidoInput): Promise<Pedido> {
    const productos: { producto: Producto; cantidad: number }[] = [];
    for (const item of input.items) {
      const producto = await this.productoRepository.findById(item.producto_id);
      if (!producto || !producto.activo) {
        throw new BadRequestException(
          `El producto con id ${item.producto_id} no existe o no está disponible`,
        );
      }
      if (!producto.tieneStockSuficiente(item.cantidad)) {
        throw new BadRequestException(
          `Stock insuficiente para el producto: ${producto.nombre}. ` +
            `Disponible: ${producto.stockActual}, Solicitado: ${item.cantidad}`,
        );
      }
      productos.push({ producto, cantidad: item.cantidad });
    }

    const cliente = await this.resolverCliente(input);

    const pedidoItems: PedidoItem[] = productos.map(
      ({ producto, cantidad }) => {
        const subtotal = producto.precio * cantidad;
        return new PedidoItem(
          randomUUID(),
          producto.id,
          producto.nombre,
          producto.precio,
          cantidad,
          subtotal,
        );
      },
    );

    const total = pedidoItems.reduce((suma, item) => suma + item.subtotal, 0);

    for (const { producto, cantidad } of productos) {
      await this.productoRepository.decrementarStock(producto.id, cantidad);
    }

    const pedido = new Pedido(
      randomUUID(),
      input.canal_origen,
      EstadoPedido.PENDIENTE,
      total,
      new Date(),
      cliente,
      pedidoItems,
    );

    const pedidoCreado = await this.pedidoRepository.create(pedido);

    this.pedidosGateway.emitPedidoEntrante({
      id: pedidoCreado.id,
      cliente: pedidoCreado.cliente.nombre,
      canal_origen: pedidoCreado.canalOrigen,
      total: pedidoCreado.total,
      created_at: pedidoCreado.createdAt,
    });

    return pedidoCreado;
  }

  private async resolverCliente(input: CreatePedidoInput): Promise<Cliente> {
    if (!input.cliente_whatsapp) {
      return this.clienteRepository.save(
        new Cliente(randomUUID(), 'Cliente Web', null),
      );
    }

    const existente = await this.clienteRepository.findByWhatsapp(
      input.cliente_whatsapp.numero_whatsapp,
    );
    if (existente) {
      return existente;
    }

    return this.clienteRepository.save(
      new Cliente(
        randomUUID(),
        input.cliente_whatsapp.nombre,
        input.cliente_whatsapp.numero_whatsapp,
      ),
    );
  }
}
