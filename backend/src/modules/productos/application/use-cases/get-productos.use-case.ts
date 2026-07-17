import { Inject, Injectable } from '@nestjs/common';
import { Producto } from '../../domain/entities/producto.entity';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
  type ProductoFilters,
} from '../../domain/ports/producto.repository.port';

@Injectable()
export class GetProductosUseCase {
  constructor(
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
  ) {}

  async execute(filters: ProductoFilters): Promise<Producto[]> {
    return this.productoRepository.findAll(filters);
  }
}
