import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Producto } from '../../domain/entities/producto.entity';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../domain/ports/producto.repository.port';

@Injectable()
export class DeleteProductoUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findById(id);
    if (!producto || !producto.activo) {
      throw new NotFoundException(`El producto con id ${id} no existe`);
    }

    await this.productoRepository.softDelete(id);

    return new Producto(
      producto.id,
      producto.nombre,
      producto.precio,
      producto.unidadMedida,
      producto.stockActual,
      producto.stockMinimo,
      false,
      producto.categoria,
    );
  }
}
