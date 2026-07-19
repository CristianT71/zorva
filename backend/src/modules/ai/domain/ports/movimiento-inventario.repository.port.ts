import { MovimientoInventario } from '../entities/movimiento-inventario.entity';

export interface IMovimientoInventarioRepository {
  save(movimiento: MovimientoInventario): Promise<MovimientoInventario>;
}

export const MOVIMIENTO_INVENTARIO_REPOSITORY = Symbol(
  'IMovimientoInventarioRepository',
);
