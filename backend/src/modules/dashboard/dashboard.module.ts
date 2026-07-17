import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PedidoItemTypeormEntity } from '../pedidos/infrastructure/entities/pedido-item.typeorm-entity';
import { PedidoTypeormEntity } from '../pedidos/infrastructure/entities/pedido.typeorm-entity';
import { GetEstadisticasUseCase } from './application/use-cases/get-estadisticas.use-case';
import { GetResumenDiarioUseCase } from './application/use-cases/get-resumen-diario.use-case';
import { GetTopProductosUseCase } from './application/use-cases/get-top-productos.use-case';
import { DASHBOARD_REPOSITORY } from './domain/ports/dashboard.repository.port';
import { TypeormDashboardRepository } from './infrastructure/adapters/typeorm-dashboard.repository';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PedidoTypeormEntity, PedidoItemTypeormEntity]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: TypeormDashboardRepository },
    GetEstadisticasUseCase,
    GetTopProductosUseCase,
    GetResumenDiarioUseCase,
  ],
  exports: [DASHBOARD_REPOSITORY],
})
export class DashboardModule {}
