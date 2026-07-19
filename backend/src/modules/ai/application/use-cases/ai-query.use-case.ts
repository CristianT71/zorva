import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
} from '../../../dashboard/domain/ports/dashboard.repository.port';
import {
  type IPedidoRepository,
  PEDIDO_REPOSITORY,
} from '../../../pedidos/domain/ports/pedido.repository.port';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../../productos/domain/ports/producto.repository.port';
import {
  AI_SERVICE,
  type AiQueryResult,
  type IAiService,
} from '../../domain/ports/ai.service.port';

@Injectable()
export class AiQueryUseCase {
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: IAiService,
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(prompt: string): Promise<AiQueryResult> {
    const [productos, pedidosRecientes, resumenDiario] = await Promise.all([
      this.productoRepository.findAll({}),
      this.pedidoRepository.findAll({}),
      this.dashboardRepository.getResumenDiario(),
    ]);

    const context = {
      productos: productos.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        stock_actual: producto.stockActual,
        stock_minimo: producto.stockMinimo,
        categoria: producto.categoria.nombre,
      })),
      pedidos_recientes: pedidosRecientes.slice(0, 20).map((pedido) => ({
        id: pedido.id,
        canal_origen: pedido.canalOrigen,
        estado: pedido.estado,
        total: pedido.total,
        created_at: pedido.createdAt,
      })),
      estadisticas_del_dia: resumenDiario,
    };

    return this.aiService.interpretQuery(prompt, context);
  }
}
