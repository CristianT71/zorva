import { Module } from '@nestjs/common';
import { PedidosGateway } from './pedidos.gateway';

@Module({
  providers: [PedidosGateway],
  exports: [PedidosGateway],
})
export class WebsocketModule {}
