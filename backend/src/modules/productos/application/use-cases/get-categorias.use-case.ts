import { Inject, Injectable } from '@nestjs/common';
import { Categoria } from '../../domain/entities/categoria.entity';
import {
  CATEGORIA_REPOSITORY,
  type ICategoriaRepository,
} from '../../domain/ports/categoria.repository.port';

@Injectable()
export class GetCategoriasUseCase {
  constructor(
    @Inject(CATEGORIA_REPOSITORY)
    private readonly categoriaRepository: ICategoriaRepository,
  ) {}

  async execute(): Promise<Categoria[]> {
    return this.categoriaRepository.findAll();
  }
}
