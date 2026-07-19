export type TipoMovimiento = 'entrada' | 'salida';

export class MovimientoInventario {
  constructor(
    public readonly id: string,
    public readonly productoId: string,
    public readonly tipo: TipoMovimiento,
    public readonly cantidad: number,
    public readonly motivo: string,
    public readonly createdAt: Date,
  ) {}
}
