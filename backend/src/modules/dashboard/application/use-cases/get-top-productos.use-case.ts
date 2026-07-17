import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
  type TopProducto,
} from '../../domain/ports/dashboard.repository.port';

@Injectable()
export class GetTopProductosUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<TopProducto[]> {
    return this.dashboardRepository.getTopProductos();
  }
}
