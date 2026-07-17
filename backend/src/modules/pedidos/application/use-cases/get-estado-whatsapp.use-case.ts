import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  type IPedidoRepository,
  PEDIDO_REPOSITORY,
} from '../../domain/ports/pedido.repository.port';

@Injectable()
export class GetEstadoWhatsappUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(numeroWhatsapp: string): Promise<Pedido> {
    const pedido =
      await this.pedidoRepository.findUltimoPorWhatsapp(numeroWhatsapp);
    if (!pedido) {
      throw new NotFoundException(
        `No se encontraron pedidos para el número ${numeroWhatsapp}`,
      );
    }
    return pedido;
  }
}
