import { Inject, Injectable } from '@nestjs/common';
import { Pedido } from '../../domain/entities/pedido.entity';
import {
  type IPedidoRepository,
  PEDIDO_REPOSITORY,
  type PedidoFilters,
} from '../../domain/ports/pedido.repository.port';

@Injectable()
export class GetPedidosUseCase {
  constructor(
    @Inject(PEDIDO_REPOSITORY)
    private readonly pedidoRepository: IPedidoRepository,
  ) {}

  async execute(filters: PedidoFilters): Promise<Pedido[]> {
    return this.pedidoRepository.findAll(filters);
  }
}
