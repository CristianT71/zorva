import { Inject, Injectable } from '@nestjs/common';
import {
  DASHBOARD_REPOSITORY,
  type IDashboardRepository,
  type ResumenDiario,
} from '../../domain/ports/dashboard.repository.port';

@Injectable()
export class GetResumenDiarioUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY)
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(): Promise<ResumenDiario> {
    return this.dashboardRepository.getResumenDiario();
  }
}
