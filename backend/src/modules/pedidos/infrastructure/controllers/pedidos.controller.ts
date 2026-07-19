import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../../auth/infrastructure/adapters/api-key.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/adapters/jwt-auth.guard';
import { CreatePedidoUseCase } from '../../application/use-cases/create-pedido.use-case';
import { GetEstadoWhatsappUseCase } from '../../application/use-cases/get-estado-whatsapp.use-case';
import { GetPedidosUseCase } from '../../application/use-cases/get-pedidos.use-case';
import { UpdateEstadoPedidoUseCase } from '../../application/use-cases/update-estado-pedido.use-case';
import { Pedido } from '../../domain/entities/pedido.entity';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { QueryEstadoWhatsappDto } from '../dto/query-estado-whatsapp.dto';
import { QueryPedidoDto } from '../dto/query-pedido.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(
    private readonly createPedidoUseCase: CreatePedidoUseCase,
    private readonly getPedidosUseCase: GetPedidosUseCase,
    private readonly updateEstadoPedidoUseCase: UpdateEstadoPedidoUseCase,
    private readonly getEstadoWhatsappUseCase: GetEstadoWhatsappUseCase,
  ) {}

  @UseGuards(ApiKeyGuard)
  @Post()
  async create(@Body() dto: CreatePedidoDto) {
    const pedido = await this.createPedidoUseCase.execute(dto);
    return this.toResponse(pedido);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query: QueryPedidoDto) {
    const pedidos = await this.getPedidosUseCase.execute(query);
    return pedidos.map((pedido) => this.toResponse(pedido));
  }

  @UseGuards(ApiKeyGuard)
  @Get('estado-whatsapp')
  async estadoWhatsapp(@Query() query: QueryEstadoWhatsappDto) {
    const pedido = await this.getEstadoWhatsappUseCase.execute(
      query.numero_whatsapp,
    );
    return {
      id: pedido.id,
      estado: pedido.estado,
      total: pedido.total,
      fecha: pedido.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/estado')
  async updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    const pedido = await this.updateEstadoPedidoUseCase.execute(id, dto.estado);
    return this.toResponse(pedido);
  }

  private toResponse(pedido: Pedido) {
    return {
      id: pedido.id,
      canal_origen: pedido.canalOrigen,
      estado: pedido.estado,
      total: pedido.total,
      created_at: pedido.createdAt,
      cliente: {
        id: pedido.cliente.id,
        nombre: pedido.cliente.nombre,
        numero_whatsapp: pedido.cliente.numeroWhatsapp,
      },
      items: pedido.items.map((item) => ({
        id: item.id,
        producto_id: item.productoId,
        nombre_producto: item.nombreProducto,
        precio_unitario: item.precioUnitario,
        cantidad: item.cantidad,
        subtotal: item.subtotal,
      })),
    };
  }
}
