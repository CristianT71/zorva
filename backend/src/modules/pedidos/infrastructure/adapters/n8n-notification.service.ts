import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pedido } from '../../domain/entities/pedido.entity';

@Injectable()
export class N8nNotificationService {
  private readonly logger = new Logger(N8nNotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  async notificarCambioEstado(pedido: Pedido): Promise<void> {
    const numeroWhatsapp = pedido.cliente.numeroWhatsapp;
    if (!numeroWhatsapp) {
      return;
    }

    const url = this.configService.get<string>('N8N_WEBHOOK_ESTADO_URL');
    if (!url) {
      return;
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret':
            this.configService.get<string>('N8N_WEBHOOK_SECRET') ?? '',
        },
        body: JSON.stringify({
          pedido_id: pedido.id,
          estado: pedido.estado,
          total: pedido.total,
          numero_whatsapp: numeroWhatsapp,
          nombre_cliente: pedido.cliente.nombre,
        }),
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo notificar a n8n el cambio de estado del pedido ${pedido.id}: ${(error as Error).message}`,
      );
    }
  }
}
