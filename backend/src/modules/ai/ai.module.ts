import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { ProductosModule } from '../productos/productos.module';
import { AiQueryUseCase } from './application/use-cases/ai-query.use-case';
import { AiStockUpdateUseCase } from './application/use-cases/ai-stock-update.use-case';
import { AI_SERVICE } from './domain/ports/ai.service.port';
import { MOVIMIENTO_INVENTARIO_REPOSITORY } from './domain/ports/movimiento-inventario.repository.port';
import { OpenAiAdapter } from './infrastructure/adapters/openai.adapter';
import { TypeormMovimientoInventarioRepository } from './infrastructure/adapters/typeorm-movimiento-inventario.repository';
import { AiController } from './infrastructure/controllers/ai.controller';
import { MovimientoInventarioTypeormEntity } from './infrastructure/entities/movimiento-inventario.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoInventarioTypeormEntity]),
    AuthModule,
    ProductosModule,
    PedidosModule,
    DashboardModule,
  ],
  controllers: [AiController],
  providers: [
    { provide: AI_SERVICE, useClass: OpenAiAdapter },
    {
      provide: MOVIMIENTO_INVENTARIO_REPOSITORY,
      useClass: TypeormMovimientoInventarioRepository,
    },
    AiQueryUseCase,
    AiStockUpdateUseCase,
  ],
})
export class AiModule {}
