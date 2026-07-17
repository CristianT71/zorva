import { Producto } from '../entities/producto.entity';

export interface ProductoFilters {
  search?: string;
  categoriaId?: number;
}

export interface IProductoRepository {
  findAll(filters: ProductoFilters): Promise<Producto[]>;
  findById(id: string): Promise<Producto | null>;
  findByNombreLike(nombre: string): Promise<Producto | null>;
  save(producto: Producto): Promise<Producto>;
  softDelete(id: string): Promise<void>;
  decrementarStock(id: string, cantidad: number): Promise<void>;
  incrementarStock(id: string, cantidad: number): Promise<void>;
}

export const PRODUCTO_REPOSITORY = Symbol('IProductoRepository');
