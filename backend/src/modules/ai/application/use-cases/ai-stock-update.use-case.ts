import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  type IProductoRepository,
  PRODUCTO_REPOSITORY,
} from '../../../productos/domain/ports/producto.repository.port';
import { MovimientoInventario } from '../../domain/entities/movimiento-inventario.entity';
import {
  AI_SERVICE,
  type IAiService,
} from '../../domain/ports/ai.service.port';
import {
  type IMovimientoInventarioRepository,
  MOVIMIENTO_INVENTARIO_REPOSITORY,
} from '../../domain/ports/movimiento-inventario.repository.port';

export interface AiStockUpdateResult {
  success: boolean;
  message: string;
  movimiento: { tipo: string; cantidad: number; motivo: string };
}

@Injectable()
export class AiStockUpdateUseCase {
  constructor(
    @Inject(AI_SERVICE) private readonly aiService: IAiService,
    @Inject(PRODUCTO_REPOSITORY)
    private readonly productoRepository: IProductoRepository,
    @Inject(MOVIMIENTO_INVENTARIO_REPOSITORY)
    private readonly movimientoRepository: IMovimientoInventarioRepository,
  ) {}

  async execute(prompt: string): Promise<AiStockUpdateResult> {
    const interpretacion = await this.aiService.interpretStockUpdate(prompt);

    if (interpretacion.error) {
      throw new BadRequestException(interpretacion.error);
    }

    if (
      !interpretacion.producto_nombre ||
      !interpretacion.cantidad ||
      !interpretacion.tipo
    ) {
      throw new BadRequestException(
        'No se pudo interpretar la instrucción de stock',
      );
    }

    const producto = await this.productoRepository.findByNombreLike(
      interpretacion.producto_nombre,
    );
    if (!producto) {
      throw new BadRequestException(
        `No se encontró ningún producto que coincida con "${interpretacion.producto_nombre}"`,
      );
    }

    if (interpretacion.tipo === 'entrada') {
      await this.productoRepository.incrementarStock(
        producto.id,
        interpretacion.cantidad,
      );
    } else {
      if (!producto.tieneStockSuficiente(interpretacion.cantidad)) {
        throw new BadRequestException(
          `Stock insuficiente para el producto: ${producto.nombre}. ` +
            `Disponible: ${producto.stockActual}, Solicitado: ${interpretacion.cantidad}`,
        );
      }
      await this.productoRepository.decrementarStock(
        producto.id,
        interpretacion.cantidad,
      );
    }

    await this.movimientoRepository.save(
      new MovimientoInventario(
        randomUUID(),
        producto.id,
        interpretacion.tipo,
        interpretacion.cantidad,
        prompt,
        new Date(),
      ),
    );

    return {
      success: true,
      message: `Stock de "${producto.nombre}" actualizado correctamente`,
      movimiento: {
        tipo: interpretacion.tipo,
        cantidad: interpretacion.cantidad,
        motivo: prompt,
      },
    };
  }
}
