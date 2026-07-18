import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/infrastructure/adapters/api-key.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/adapters/jwt-auth.guard';
import { GetEstadisticasUseCase } from '../../application/use-cases/get-estadisticas.use-case';
import { GetResumenDiarioUseCase } from '../../application/use-cases/get-resumen-diario.use-case';
import { GetTopProductosUseCase } from '../../application/use-cases/get-top-productos.use-case';
import { QueryEstadisticasDto } from '../dto/query-estadisticas.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getEstadisticasUseCase: GetEstadisticasUseCase,
    private readonly getTopProductosUseCase: GetTopProductosUseCase,
    private readonly getResumenDiarioUseCase: GetResumenDiarioUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('estadisticas')
  async estadisticas(@Query() query: QueryEstadisticasDto) {
    const resultado = await this.getEstadisticasUseCase.execute(
      query.periodo ?? 'dia',
    );
    return {
      ventas_totales: resultado.ventasTotales,
      historico_grafica: resultado.historicoGrafica,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('productos-mas-vendidos')
  async productosMasVendidos() {
    const productos = await this.getTopProductosUseCase.execute();
    return productos.map((producto) => ({
      producto_id: producto.productoId,
      nombre: producto.nombre,
      cantidad_vendida: producto.cantidadVendida,
    }));
  }

  @UseGuards(ApiKeyGuard)
  @Get('resumen-diario')
  async resumenDiario() {
    const resumen = await this.getResumenDiarioUseCase.execute();
    return {
      fecha: resumen.fecha,
      total_ventas_dia: resumen.totalVentasDia,
      pedidos_totales: resumen.pedidosTotales,
      pedidos_por_canal: resumen.pedidosPorCanal,
      producto_estrella: resumen.productoEstrella,
    };
  }
}
