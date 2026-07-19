import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ProductosModule } from '../productos/productos.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { CreatePedidoUseCase } from './application/use-cases/create-pedido.use-case';
import { GetEstadoWhatsappUseCase } from './application/use-cases/get-estado-whatsapp.use-case';
import { GetPedidosUseCase } from './application/use-cases/get-pedidos.use-case';
import { UpdateEstadoPedidoUseCase } from './application/use-cases/update-estado-pedido.use-case';
import { CLIENTE_REPOSITORY } from './domain/ports/cliente.repository.port';
import { PEDIDO_REPOSITORY } from './domain/ports/pedido.repository.port';
import { N8nNotificationService } from './infrastructure/adapters/n8n-notification.service';
import { TypeormClienteRepository } from './infrastructure/adapters/typeorm-cliente.repository';
import { TypeormPedidoRepository } from './infrastructure/adapters/typeorm-pedido.repository';
import { PedidosController } from './infrastructure/controllers/pedidos.controller';
import { ClienteTypeormEntity } from './infrastructure/entities/cliente.typeorm-entity';
import { PedidoItemTypeormEntity } from './infrastructure/entities/pedido-item.typeorm-entity';
import { PedidoTypeormEntity } from './infrastructure/entities/pedido.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PedidoTypeormEntity,
      PedidoItemTypeormEntity,
      ClienteTypeormEntity,
    ]),
    AuthModule,
    ProductosModule,
    WebsocketModule,
  ],
  controllers: [PedidosController],
  providers: [
    { provide: PEDIDO_REPOSITORY, useClass: TypeormPedidoRepository },
    { provide: CLIENTE_REPOSITORY, useClass: TypeormClienteRepository },
    CreatePedidoUseCase,
    GetPedidosUseCase,
    UpdateEstadoPedidoUseCase,
    GetEstadoWhatsappUseCase,
    N8nNotificationService,
  ],
  exports: [PEDIDO_REPOSITORY],
})
export class PedidosModule {}
