import { TipoMovimiento } from '../entities/movimiento-inventario.entity';

export interface AiQueryResult {
  tipo_consulta: string;
  respuesta_texto: string;
  data: unknown[];
}

export interface AiStockUpdateInterpretation {
  producto_nombre?: string;
  cantidad?: number;
  tipo?: TipoMovimiento;
  error?: string;
}

export interface IAiService {
  interpretQuery(prompt: string, context: unknown): Promise<AiQueryResult>;
  interpretStockUpdate(prompt: string): Promise<AiStockUpdateInterpretation>;
}

export const AI_SERVICE = Symbol('IAiService');
