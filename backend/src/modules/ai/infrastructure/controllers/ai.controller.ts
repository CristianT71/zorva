import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/adapters/jwt-auth.guard';
import { AiQueryUseCase } from '../../application/use-cases/ai-query.use-case';
import { AiStockUpdateUseCase } from '../../application/use-cases/ai-stock-update.use-case';
import { AiQueryDto } from '../dto/ai-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiQueryUseCase: AiQueryUseCase,
    private readonly aiStockUpdateUseCase: AiStockUpdateUseCase,
  ) {}

  @Post('query')
  async query(@Body() dto: AiQueryDto) {
    return this.aiQueryUseCase.execute(dto.prompt);
  }

  @Post('stock-update')
  async stockUpdate(@Body() dto: AiQueryDto) {
    return this.aiStockUpdateUseCase.execute(dto.prompt);
  }
}
