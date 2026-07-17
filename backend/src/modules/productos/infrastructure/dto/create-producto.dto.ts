import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  categoria_id: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsString()
  unidad_medida: string;

  @IsNumber()
  @Min(0)
  stock_actual: number;

  @IsNumber()
  @Min(0)
  stock_minimo: number;
}
