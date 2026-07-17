import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ClienteWhatsappDto {
  @IsString()
  @MinLength(5)
  numero_whatsapp: string;

  @IsString()
  nombre: string;
}

export class PedidoItemDto {
  @IsUUID()
  producto_id: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsIn(['whatsapp', 'web'])
  canal_origen: 'whatsapp' | 'web';

  @IsOptional()
  @ValidateNested()
  @Type(() => ClienteWhatsappDto)
  cliente_whatsapp?: ClienteWhatsappDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  items: PedidoItemDto[];
}
