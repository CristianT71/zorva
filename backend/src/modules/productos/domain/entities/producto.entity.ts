import { Categoria } from './categoria.entity';

export class Producto {
  constructor(
    public readonly id: string,
    public nombre: string,
    public precio: number,
    public unidadMedida: string,
    public stockActual: number,
    public stockMinimo: number,
    public activo: boolean,
    public categoria: Categoria,
  ) {}

  tieneStockSuficiente(cantidad: number): boolean {
    return this.stockActual >= cantidad;
  }
}
