import { IsIn, IsOptional } from 'class-validator';

export class QueryEstadisticasDto {
  @IsOptional()
  @IsIn(['dia', 'semana', 'mes'])
  periodo?: 'dia' | 'semana' | 'mes';
}
