import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/adapters/jwt-auth.guard';
import { CreateProductoUseCase } from '../../application/use-cases/create-producto.use-case';
import { DeleteProductoUseCase } from '../../application/use-cases/delete-producto.use-case';
import { GetProductosUseCase } from '../../application/use-cases/get-productos.use-case';
import { UpdateProductoUseCase } from '../../application/use-cases/update-producto.use-case';
import { Producto } from '../../domain/entities/producto.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { QueryProductoDto } from '../dto/query-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';

@Controller('productos')
export class ProductosController {
  constructor(
    private readonly getProductosUseCase: GetProductosUseCase,
    private readonly createProductoUseCase: CreateProductoUseCase,
    private readonly updateProductoUseCase: UpdateProductoUseCase,
    private readonly deleteProductoUseCase: DeleteProductoUseCase,
  ) {}

  @Get()
  async findAll(@Query() query: QueryProductoDto) {
    const productos = await this.getProductosUseCase.execute({
      search: query.search,
      categoriaId: query.categoria_id,
    });
    return productos.map((producto) => this.toResponse(producto));
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateProductoDto) {
    const producto = await this.createProductoUseCase.execute(dto);
    return this.toResponse(producto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    const producto = await this.updateProductoUseCase.execute(id, dto);
    return this.toResponse(producto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const producto = await this.deleteProductoUseCase.execute(id);
    return this.toResponse(producto);
  }

  private toResponse(producto: Producto) {
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      unidad_medida: producto.unidadMedida,
      stock_actual: producto.stockActual,
      stock_minimo: producto.stockMinimo,
      activo: producto.activo,
      categoria: {
        id: producto.categoria.id,
        nombre: producto.categoria.nombre,
      },
    };
  }
}
