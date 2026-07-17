import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type EstadisticasResult,
  type IDashboardRepository,
  type PeriodoEstadisticas,
} from '../../domain/ports/dashboard.repository.port';

@Injectable()
export class GetEstadisticasUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(periodo: PeriodoEstadisticas): Promise<EstadisticasResult> {
    return this.dashboardRepository.getEstadisticas(periodo);
  }
}
