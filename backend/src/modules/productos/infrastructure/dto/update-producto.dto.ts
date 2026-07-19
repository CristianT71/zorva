import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  categoria_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsString()
  unidad_medida?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_actual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo?: number;
}
