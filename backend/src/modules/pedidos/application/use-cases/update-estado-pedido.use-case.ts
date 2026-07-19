import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  type IPedidoRepository,
  PEDIDO_REPOSITORY,
} from '../../domain/ports/pedido.repository.port';
import { EstadoPedido } from '../../domain/value-objects/estado-pedido.vo';
import { N8nNotificationService } from '../../infrastructure/adapters/n8n-notification.service';

@Injectable()
export class UpdateEstadoPedidoUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
    private readonly n8nNotificationService: N8nNotificationService,
  ) {}

  async execute(id: string, estado: EstadoPedido): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException(`El pedido con id ${id} no existe`);
    }

    const pedidoActualizado = await this.pedidoRepository.updateEstado(
      id,
      estado,
    );
    await this.n8nNotificationService.notificarCambioEstado(pedidoActualizado);

    return pedidoActualizado;
  }
}
