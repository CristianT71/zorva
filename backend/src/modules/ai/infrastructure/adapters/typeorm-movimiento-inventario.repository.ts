import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario } from '../../domain/entities/movimiento-inventario.entity';
import { IMovimientoInventarioRepository } from '../../domain/ports/movimiento-inventario.repository.port';
import { MovimientoInventarioTypeormEntity } from '../entities/movimiento-inventario.typeorm-entity';

@Injectable()
export class TypeormMovimientoInventarioRepository implements IMovimientoInventarioRepository {
  constructor(
    @InjectRepository(MovimientoInventarioTypeormEntity)
    private readonly repository: Repository<MovimientoInventarioTypeormEntity>,
  ) {}

  async save(movimiento: MovimientoInventario): Promise<MovimientoInventario> {
    const entity = new MovimientoInventarioTypeormEntity();
    entity.id = movimiento.id;
    entity.productoId = movimiento.productoId;
    entity.tipo = movimiento.tipo;
    entity.cantidad = movimiento.cantidad;
    entity.motivo = movimiento.motivo;
    const saved = await this.repository.save(entity);
    return new MovimientoInventario(
      saved.id,
      saved.productoId,
      saved.tipo,
      saved.cantidad,
      saved.motivo,
      saved.createdAt,
    );
  }
}
