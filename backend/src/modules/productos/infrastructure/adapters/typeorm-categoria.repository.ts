import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../../domain/entities/categoria.entity';
import { ICategoriaRepository } from '../../domain/ports/categoria.repository.port';
import { CategoriaTypeormEntity } from '../entities/categoria.typeorm-entity';

@Injectable()
export class TypeormCategoriaRepository implements ICategoriaRepository {
  constructor(
    @InjectRepository(CategoriaTypeormEntity)
    private readonly repository: Repository<CategoriaTypeormEntity>,
  ) {}

  async findAll(): Promise<Categoria[]> {
    const entities = await this.repository.find({ order: { nombre: 'ASC' } });
    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: number): Promise<Categoria | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: CategoriaTypeormEntity): Categoria {
    return new Categoria(entity.id, entity.nombre, entity.descripcion);
  }
}
