import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../domain/entities/cliente.entity';
import { PedidoItem } from '../../domain/entities/pedido-item.entity';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  IPedidoRepository,
  PedidoFilters,
} from '../../domain/ports/pedido.repository.port';
import { EstadoPedido } from '../../domain/value-objects/estado-pedido.vo';
import { ClienteTypeormEntity } from '../entities/cliente.typeorm-entity';
import { PedidoItemTypeormEntity } from '../entities/pedido-item.typeorm-entity';
import { PedidoTypeormEntity } from '../entities/pedido.typeorm-entity';

@Injectable()
export class TypeormPedidoRepository implements IPedidoRepository {
  constructor(
    @InjectRepository(PedidoTypeormEntity)
    private readonly repository: Repository<PedidoTypeormEntity>,
  ) {}

  async create(pedido: Pedido): Promise<Pedido> {
    const entity = new PedidoTypeormEntity();
    entity.id = pedido.id;
    entity.canalOrigen = pedido.canalOrigen;
    entity.estado = pedido.estado;
    entity.total = pedido.total;
    entity.cliente = { id: pedido.cliente.id } as ClienteTypeormEntity;
    entity.items = pedido.items.map((item) => {
      const itemEntity = new PedidoItemTypeormEntity();
      itemEntity.id = item.id;
      itemEntity.productoId = item.productoId;
      itemEntity.nombreProducto = item.nombreProducto;
      itemEntity.precioUnitario = item.precioUnitario;
      itemEntity.cantidad = item.cantidad;
      itemEntity.subtotal = item.subtotal;
      return itemEntity;
    });

    const saved = await this.repository.save(entity);
    const reloaded = await this.repository.findOne({ where: { id: saved.id } });
    return this.toDomain(reloaded as PedidoTypeormEntity);
  }

  async findAll(filters: PedidoFilters): Promise<Pedido[]> {
    const query = this.repository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.items', 'items');

    if (filters.canal) {
      query.andWhere('pedido.canalOrigen = :canal', { canal: filters.canal });
    }

    if (filters.estado) {
      query.andWhere('pedido.estado = :estado', { estado: filters.estado });
    }

    if (filters.fecha) {
      query.andWhere('DATE(pedido.created_at) = :fecha', {
        fecha: filters.fecha,
      });
    }

    const entities = await query.orderBy('pedido.created_at', 'DESC').getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Pedido | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async updateEstado(id: string, estado: EstadoPedido): Promise<Pedido> {
    await this.repository.update({ id }, { estado });
    const entity = await this.repository.findOne({ where: { id } });
    return this.toDomain(entity as PedidoTypeormEntity);
  }

  async findUltimoPorWhatsapp(numeroWhatsapp: string): Promise<Pedido | null> {
    const entity = await this.repository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.cliente', 'cliente')
      .leftJoinAndSelect('pedido.items', 'items')
      .where('cliente.numeroWhatsapp = :numeroWhatsapp', { numeroWhatsapp })
      .orderBy('pedido.created_at', 'DESC')
      .getOne();

    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: PedidoTypeormEntity): Pedido {
    const cliente = new Cliente(
      entity.cliente.id,
      entity.cliente.nombre,
      entity.cliente.numeroWhatsapp,
    );

    const items = (entity.items ?? []).map(
      (item) =>
        new PedidoItem(
          item.id,
          item.productoId,
          item.nombreProducto,
          Number(item.precioUnitario),
          item.cantidad,
          Number(item.subtotal),
        ),
    );

    return new Pedido(
      entity.id,
      entity.canalOrigen,
      entity.estado,
      Number(entity.total),
      entity.createdAt,
      cliente,
      items,
    );
  }
}
