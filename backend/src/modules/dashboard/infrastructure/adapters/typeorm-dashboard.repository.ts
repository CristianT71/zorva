import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoItemTypeormEntity } from '../../../pedidos/infrastructure/entities/pedido-item.typeorm-entity';
import { PedidoTypeormEntity } from '../../../pedidos/infrastructure/entities/pedido.typeorm-entity';
import { EstadoPedido } from '../../../pedidos/domain/value-objects/estado-pedido.vo';
import {
  type EstadisticasResult,
  type IDashboardRepository,
  type PeriodoEstadisticas,
  type ResumenDiario,
  type TopProducto,
} from '../../domain/ports/dashboard.repository.port';

interface EstadisticaRawRow {
  fecha: string;
  total: string;
}

interface TopProductoRawRow {
  productoId: string;
  nombre: string;
  cantidadVendida: string;
}

const RANGO_POR_PERIODO: Record<
  PeriodoEstadisticas,
  { truncar: string; intervalo: string }
> = {
  dia: { truncar: 'hour', intervalo: '24 hours' },
  semana: { truncar: 'day', intervalo: '7 days' },
  mes: { truncar: 'day', intervalo: '30 days' },
};

@Injectable()
export class TypeormDashboardRepository implements IDashboardRepository {
  constructor(
    @InjectRepository(PedidoTypeormEntity)
    private readonly pedidoRepository: Repository<PedidoTypeormEntity>,
    @InjectRepository(PedidoItemTypeormEntity)
    private readonly pedidoItemRepository: Repository<PedidoItemTypeormEntity>,
  ) {}

  async getEstadisticas(
    periodo: PeriodoEstadisticas,
  ): Promise<EstadisticasResult> {
    const { truncar, intervalo } = RANGO_POR_PERIODO[periodo];

    const filas = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .select(`DATE_TRUNC('${truncar}', pedido.created_at)`, 'fecha')
      .addSelect('SUM(pedido.total)', 'total')
      .where(`pedido.created_at >= NOW() - INTERVAL '${intervalo}'`)
      .andWhere("pedido.estado != 'cancelado'")
      .groupBy('fecha')
      .orderBy('fecha', 'ASC')
      .getRawMany<EstadisticaRawRow>();

    const historicoGrafica = filas.map((fila) => ({
      fecha: fila.fecha,
      total: Number(fila.total),
    }));

    const ventasTotales = historicoGrafica.reduce(
      (suma, punto) => suma + punto.total,
      0,
    );

    return { ventasTotales, historicoGrafica };
  }

  async getTopProductos(): Promise<TopProducto[]> {
    const filas = await this.pedidoItemRepository
      .createQueryBuilder('item')
      .select('item.producto_id', 'productoId')
      .addSelect('item.nombre_producto', 'nombre')
      .addSelect('SUM(item.cantidad)', 'cantidadVendida')
      .groupBy('item.producto_id')
      .addGroupBy('item.nombre_producto')
      .orderBy('"cantidadVendida"', 'DESC')
      .limit(10)
      .getRawMany<TopProductoRawRow>();

    return filas.map((fila) => ({
      productoId: fila.productoId,
      nombre: fila.nombre,
      cantidadVendida: Number(fila.cantidadVendida),
    }));
  }

  async getResumenDiario(): Promise<ResumenDiario> {
    const pedidosHoy = await this.pedidoRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.items', 'items')
      .where('DATE(pedido.created_at) = CURRENT_DATE')
      .getMany();

    const totalVentasDia = pedidosHoy
      .filter((pedido) => pedido.estado !== EstadoPedido.CANCELADO)
      .reduce((suma, pedido) => suma + Number(pedido.total), 0);

    const pedidosPorCanal = { whatsapp: 0, web: 0 };
    for (const pedido of pedidosHoy) {
      if (pedido.canalOrigen === 'whatsapp') {
        pedidosPorCanal.whatsapp += 1;
      } else {
        pedidosPorCanal.web += 1;
      }
    }

    const cantidadPorProducto = new Map<string, number>();
    for (const pedido of pedidosHoy) {
      for (const item of pedido.items ?? []) {
        cantidadPorProducto.set(
          item.nombreProducto,
          (cantidadPorProducto.get(item.nombreProducto) ?? 0) + item.cantidad,
        );
      }
    }

    let productoEstrella: string | null = null;
    let maxCantidad = 0;
    for (const [nombre, cantidad] of cantidadPorProducto.entries()) {
      if (cantidad > maxCantidad) {
        maxCantidad = cantidad;
        productoEstrella = nombre;
      }
    }

    return {
      fecha: new Date().toISOString().slice(0, 10),
      totalVentasDia,
      pedidosTotales: pedidosHoy.length,
      pedidosPorCanal,
      productoEstrella,
    };
  }
}
