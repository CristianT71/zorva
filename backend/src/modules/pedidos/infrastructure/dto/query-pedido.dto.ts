import { IsOptional, IsString } from 'class-validator';

export class QueryPedidoDto {
  @IsOptional()
  @IsString()
  canal?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  fecha?: string;
}
