import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CreateProductoUseCase } from './application/use-cases/create-producto.use-case';
import { DeleteProductoUseCase } from './application/use-cases/delete-producto.use-case';
import { GetCategoriasUseCase } from './application/use-cases/get-categorias.use-case';
import { GetProductosUseCase } from './application/use-cases/get-productos.use-case';
import { UpdateProductoUseCase } from './application/use-cases/update-producto.use-case';
import { CATEGORIA_REPOSITORY } from './domain/ports/categoria.repository.port';
import { PRODUCTO_REPOSITORY } from './domain/ports/producto.repository.port';
import { TypeormCategoriaRepository } from './infrastructure/adapters/typeorm-categoria.repository';
import { TypeormProductoRepository } from './infrastructure/adapters/typeorm-producto.repository';
import { CategoriasController } from './infrastructure/controllers/categorias.controller';
import { ProductosController } from './infrastructure/controllers/productos.controller';
import { CategoriaTypeormEntity } from './infrastructure/entities/categoria.typeorm-entity';
import { ProductoTypeormEntity } from './infrastructure/entities/producto.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoTypeormEntity, CategoriaTypeormEntity]),
    AuthModule,
  ],
  controllers: [ProductosController, CategoriasController],
  providers: [
    { provide: PRODUCTO_REPOSITORY, useClass: TypeormProductoRepository },
    { provide: CATEGORIA_REPOSITORY, useClass: TypeormCategoriaRepository },
    GetProductosUseCase,
    CreateProductoUseCase,
    UpdateProductoUseCase,
    DeleteProductoUseCase,
    GetCategoriasUseCase,
  ],
  exports: [PRODUCTO_REPOSITORY, CATEGORIA_REPOSITORY],
})
export class ProductosModule {}
