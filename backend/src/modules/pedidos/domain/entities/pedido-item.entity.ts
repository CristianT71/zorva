export class PedidoItem {
  constructor(
    public readonly id: string,
    public readonly productoId: string,
    public readonly nombreProducto: string,
    public readonly precioUnitario: number,
    public readonly cantidad: number,
    public readonly subtotal: number,
  ) {}
}
