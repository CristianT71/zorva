import { Controller, Get } from '@nestjs/common';
import { GetCategoriasUseCase } from '../../application/use-cases/get-categorias.use-case';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly getCategoriasUseCase: GetCategoriasUseCase) {}

  @Get()
  async findAll() {
    const categorias = await this.getCategoriasUseCase.execute();
    return categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    }));
  }
}
