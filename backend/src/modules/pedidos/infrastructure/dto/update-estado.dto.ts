import { IsEnum } from 'class-validator';
import { EstadoPedido } from '../../domain/value-objects/estado-pedido.vo';

export class UpdateEstadoDto {
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;
}
