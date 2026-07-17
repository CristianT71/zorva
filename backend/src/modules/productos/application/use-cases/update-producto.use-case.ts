import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Producto } from '../../domain/entities/producto.entity';
import {
  CATEGORIA_REPOSITORY,
  type ICategoriaRepository,
} from '../../domain/ports/categoria.repository.port';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../domain/ports/producto.repository.port';

export interface UpdateProductoInput {
  nombre?: string;
  categoria_id?: number;
  precio?: number;
  unidad_medida?: string;
  stock_actual?: number;
  stock_minimo?: number;
}

@Injectable()
export class UpdateProductoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
    @Inject(CATEGORIA_REPOSITORY)
    private readonly categoriaRepository: ICategoriaRepository,
  ) {}

  async execute(id: string, input: UpdateProductoInput): Promise<Producto> {
    const producto = await this.productoRepository.findById(id);
    if (!producto || !producto.activo) {
      throw new NotFoundException(`El producto con id ${id} no existe`);
    }

    let categoria = producto.categoria;
    if (input.categoria_id !== undefined) {
      const categoriaEncontrada = await this.categoriaRepository.findById(
        input.categoria_id,
      );
      if (!categoriaEncontrada) {
        throw new NotFoundException(
          `La categoría con id ${input.categoria_id} no existe`,
        );
      }
      categoria = categoriaEncontrada;
    }

    const productoActualizado = new Producto(
      producto.id,
      input.nombre ?? producto.nombre,
      input.precio ?? producto.precio,
      input.unidad_medida ?? producto.unidadMedida,
      input.stock_actual ?? producto.stockActual,
      input.stock_minimo ?? producto.stockMinimo,
      producto.activo,
      categoria,
    );

    return this.productoRepository.save(productoActualizado);
  }
}
