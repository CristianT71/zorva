import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  type AiQueryResult,
  type AiStockUpdateInterpretation,
  type IAiService,
} from '../../domain/ports/ai.service.port';

interface RawAiQueryResponse {
  tipo_consulta?: string;
  respuesta_texto?: string;
  data?: unknown[];
}

const MODELO = 'gpt-4o-mini';

@Injectable()
export class OpenAiAdapter implements IAiService {
  private readonly client: OpenAI;

  constructor(configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async interpretQuery(
    prompt: string,
    context: unknown,
  ): Promise<AiQueryResult> {
    const systemPrompt =
      'Eres el asistente de análisis de Zorva, un sistema de gestión de tienda. ' +
      `Tienes acceso a los siguientes datos actuales del negocio: ${JSON.stringify(context)}. ` +
      'El administrador te hace una consulta en lenguaje natural. Responde en español, ' +
      'sé conciso y preciso. Retorna un JSON con esta estructura exacta: ' +
      '{ "tipo_consulta": string, "respuesta_texto": string, "data": any[] }';

    const completion = await this.client.chat.completions.create({
      model: MODELO,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const contenido = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(contenido) as RawAiQueryResponse;

    return {
      tipo_consulta: parsed.tipo_consulta ?? 'general',
      respuesta_texto: parsed.respuesta_texto ?? '',
      data: parsed.data ?? [],
    };
  }

  async interpretStockUpdate(
    prompt: string,
  ): Promise<AiStockUpdateInterpretation> {
    const systemPrompt =
      'Eres el asistente de gestión de inventario de Zorva. El administrador te da ' +
      'una instrucción en lenguaje natural para actualizar stock. Identifica: ' +
      '- nombre o parte del nombre del producto ' +
      '- cantidad a agregar o restar ' +
      '- si es entrada o salida ' +
      'Retorna un JSON: { "producto_nombre": string, "cantidad": number, "tipo": "entrada"|"salida" } ' +
      'Si no puedes interpretar la instrucción, retorna { "error": "mensaje descriptivo" }';

    const completion = await this.client.chat.completions.create({
      model: MODELO,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const contenido = completion.choices[0]?.message?.content ?? '{}';
    return JSON.parse(contenido) as AiStockUpdateInterpretation;
  }
}
