import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../../domain/entities/categoria.entity';
import { Producto } from '../../domain/entities/producto.entity';
import {
  IProductoRepository,
  ProductoFilters,
} from '../../domain/ports/producto.repository.port';
import { CategoriaTypeormEntity } from '../entities/categoria.typeorm-entity';
import { ProductoTypeormEntity } from '../entities/producto.typeorm-entity';

@Injectable()
export class TypeormProductoRepository implements IProductoRepository {
  constructor(
    @InjectRepository(ProductoTypeormEntity)
    private readonly repository: Repository<ProductoTypeormEntity>,
  ) {}

  async findAll(filters: ProductoFilters): Promise<Producto[]> {
    const query = this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .where('producto.activo = :activo', { activo: true });

    if (filters.search) {
      query.andWhere('producto.nombre ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    if (filters.categoriaId) {
      query.andWhere('categoria.id = :categoriaId', {
        categoriaId: filters.categoriaId,
      });
    }

    const entities = await query.orderBy('producto.nombre', 'ASC').getMany();
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<Producto | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { categoria: true },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByNombreLike(nombre: string): Promise<Producto | null> {
    const entity = await this.repository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .where('producto.activo = :activo', { activo: true })
      .andWhere('producto.nombre ILIKE :nombre', { nombre: `%${nombre}%` })
      .getOne();
    return entity ? this.toDomain(entity) : null;
  }

  async save(producto: Producto): Promise<Producto> {
    const entity = this.toPersistence(producto);
    const saved = await this.repository.save(entity);
    const reloaded = await this.repository.findOne({
      where: { id: saved.id },
      relations: { categoria: true },
    });
    return this.toDomain(reloaded as ProductoTypeormEntity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.update({ id }, { activo: false });
  }

  async decrementarStock(id: string, cantidad: number): Promise<void> {
    await this.repository.decrement({ id }, 'stockActual', cantidad);
  }

  async incrementarStock(id: string, cantidad: number): Promise<void> {
    await this.repository.increment({ id }, 'stockActual', cantidad);
  }

  private toDomain(entity: ProductoTypeormEntity): Producto {
    return new Producto(
      entity.id,
      entity.nombre,
      Number(entity.precio),
      entity.unidadMedida,
      entity.stockActual,
      entity.stockMinimo,
      entity.activo,
      new Categoria(
        entity.categoria.id,
        entity.categoria.nombre,
        entity.categoria.descripcion,
      ),
    );
  }

  private toPersistence(producto: Producto): ProductoTypeormEntity {
    const entity = new ProductoTypeormEntity();
    if (producto.id) {
      entity.id = producto.id;
    }
    entity.nombre = producto.nombre;
    entity.precio = producto.precio;
    entity.unidadMedida = producto.unidadMedida;
    entity.stockActual = producto.stockActual;
    entity.stockMinimo = producto.stockMinimo;
    entity.activo = producto.activo;
    entity.categoria = { id: producto.categoria.id } as CategoriaTypeormEntity;
    return entity;
  }
}
