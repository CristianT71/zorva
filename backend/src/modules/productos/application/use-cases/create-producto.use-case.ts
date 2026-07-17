import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Producto } from '../../domain/entities/producto.entity';
import {
  CATEGORIA_REPOSITORY,
  type ICategoriaRepository,
} from '../../domain/ports/categoria.repository.port';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../domain/ports/producto.repository.port';

export interface CreateProductoInput {
  nombre: string;
  categoria_id: number;
  precio: number;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
}

@Injectable()
export class CreateProductoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
    @Inject(CATEGORIA_REPOSITORY)
    private readonly categoriaRepository: ICategoriaRepository,
  ) {}

  async execute(input: CreateProductoInput): Promise<Producto> {
    const categoria = await this.categoriaRepository.findById(
      input.categoria_id,
    );
    if (!categoria) {
      throw new NotFoundException(
        `La categoría con id ${input.categoria_id} no existe`,
      );
    }

    const producto = new Producto(
      randomUUID(),
      input.nombre,
      input.precio,
      input.unidad_medida,
      input.stock_actual,
      input.stock_minimo,
      true,
      categoria,
    );

    return this.productoRepository.save(producto);
  }
}
