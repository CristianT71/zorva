import { Categoria } from '../entities/categoria.entity';

export interface ICategoriaRepository {
  findAll(): Promise<Categoria[]>;
  findById(id: number): Promise<Categoria | null>;
}

export const CATEGORIA_REPOSITORY = Symbol('ICategoriaRepository');
