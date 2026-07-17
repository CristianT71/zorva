import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { AdminTypeormEntity } from '../../modules/auth/infrastructure/entities/admin.typeorm-entity';
import { ClienteTypeormEntity } from '../../modules/pedidos/infrastructure/entities/cliente.typeorm-entity';
import { PedidoItemTypeormEntity } from '../../modules/pedidos/infrastructure/entities/pedido-item.typeorm-entity';
import { PedidoTypeormEntity } from '../../modules/pedidos/infrastructure/entities/pedido.typeorm-entity';
import { EstadoPedido } from '../../modules/pedidos/domain/value-objects/estado-pedido.vo';
import { CategoriaTypeormEntity } from '../../modules/productos/infrastructure/entities/categoria.typeorm-entity';
import { ProductoTypeormEntity } from '../../modules/productos/infrastructure/entities/producto.typeorm-entity';

const CATEGORIAS_SEED = [
  {
    nombre: 'Granos y Cereales',
    descripcion: 'Arroz, frijoles, lentejas y cereales en general',
  },
  {
    nombre: 'Lácteos',
    descripcion: 'Leche, quesos, yogures y derivados lácteos',
  },
  {
    nombre: 'Aceites y Grasas',
    descripcion: 'Aceites vegetales, mantequilla y grasas para cocinar',
  },
  { nombre: 'Panadería', descripcion: 'Pan, harinas y productos de panadería' },
  { nombre: 'Condimentos', descripcion: 'Sal, especias, salsas y sazonadores' },
  { nombre: 'Endulzantes', descripcion: 'Azúcar, panela, miel y endulzantes' },
];

async function seedCategorias(
  dataSource: DataSource,
): Promise<CategoriaTypeormEntity[]> {
  const repository = dataSource.getRepository(CategoriaTypeormEntity);
  const categorias: CategoriaTypeormEntity[] = [];

  for (const data of CATEGORIAS_SEED) {
    let categoria = await repository.findOne({
      where: { nombre: data.nombre },
    });
    if (!categoria) {
      categoria = await repository.save(repository.create(data));
      console.log(`Categoría creada: ${categoria.nombre}`);
    }
    categorias.push(categoria);
  }

  return categorias;
}

async function seedAdmin(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(AdminTypeormEntity);
  const existente = await repository.findOne({
    where: { email: 'admin@zorva.com' },
  });
  if (existente) {
    return;
  }

  const passwordHash = await bcrypt.hash('admin123', 10);
  await repository.save(
    repository.create({
      id: randomUUID(),
      nombre: 'Cristian Trujillo',
      email: 'admin@zorva.com',
      passwordHash,
      rol: 'admin',
    }),
  );
  console.log('Admin creado: admin@zorva.com / admin123');
}

async function seedProductos(
  dataSource: DataSource,
  categorias: CategoriaTypeormEntity[],
): Promise<ProductoTypeormEntity[]> {
  const repository = dataSource.getRepository(ProductoTypeormEntity);
  const porNombre = (nombre: string) =>
    categorias.find(
      (categoria) => categoria.nombre === nombre,
    ) as CategoriaTypeormEntity;

  const productosSeed = [
    {
      nombre: 'Arroz Diana x 500g',
      categoria: porNombre('Granos y Cereales'),
      precio: 3200,
      unidadMedida: 'libra',
      stockActual: 120,
      stockMinimo: 20,
    },
    {
      nombre: 'Frijol Cargamanto',
      categoria: porNombre('Granos y Cereales'),
      precio: 4500,
      unidadMedida: 'libra',
      stockActual: 8,
      stockMinimo: 15,
    },
    {
      nombre: 'Leche Entera Alqueria 1L',
      categoria: porNombre('Lácteos'),
      precio: 4200,
      unidadMedida: 'unidad',
      stockActual: 60,
      stockMinimo: 10,
    },
    {
      nombre: 'Queso Campesino',
      categoria: porNombre('Lácteos'),
      precio: 12000,
      unidadMedida: 'libra',
      stockActual: 25,
      stockMinimo: 5,
    },
    {
      nombre: 'Aceite Girasol 1L',
      categoria: porNombre('Aceites y Grasas'),
      precio: 9800,
      unidadMedida: 'unidad',
      stockActual: 40,
      stockMinimo: 10,
    },
    {
      nombre: 'Mantequilla Ranchera',
      categoria: porNombre('Aceites y Grasas'),
      precio: 6500,
      unidadMedida: 'unidad',
      stockActual: 3,
      stockMinimo: 8,
    },
    {
      nombre: 'Pan Tajado Bimbo',
      categoria: porNombre('Panadería'),
      precio: 7200,
      unidadMedida: 'unidad',
      stockActual: 30,
      stockMinimo: 10,
    },
    {
      nombre: 'Sal Refisal 500g',
      categoria: porNombre('Condimentos'),
      precio: 1800,
      unidadMedida: 'unidad',
      stockActual: 90,
      stockMinimo: 15,
    },
    {
      nombre: 'Azúcar Manuelita 1kg',
      categoria: porNombre('Endulzantes'),
      precio: 4700,
      unidadMedida: 'kilo',
      stockActual: 55,
      stockMinimo: 12,
    },
    {
      nombre: 'Panela Redonda',
      categoria: porNombre('Endulzantes'),
      precio: 3600,
      unidadMedida: 'unidad',
      stockActual: 45,
      stockMinimo: 10,
    },
  ];

  const productos: ProductoTypeormEntity[] = [];
  for (const data of productosSeed) {
    let producto = await repository.findOne({
      where: { nombre: data.nombre },
      relations: { categoria: true },
    });
    if (!producto) {
      producto = await repository.save(
        repository.create({ id: randomUUID(), ...data, activo: true }),
      );
      console.log(`Producto creado: ${producto.nombre}`);
    }
    productos.push(producto);
  }

  return productos;
}

async function seedClientes(
  dataSource: DataSource,
): Promise<Record<string, ClienteTypeormEntity>> {
  const repository = dataSource.getRepository(ClienteTypeormEntity);
  const clientesSeed = [
    { nombre: 'María Gómez', numeroWhatsapp: '+573001112233' },
    { nombre: 'Juan Pérez', numeroWhatsapp: '+573004445566' },
    { nombre: 'Carlos Ruiz', numeroWhatsapp: '+573007778899' },
    { nombre: 'Cliente Web', numeroWhatsapp: null },
  ];

  const clientes: Record<string, ClienteTypeormEntity> = {};
  for (const data of clientesSeed) {
    let cliente = data.numeroWhatsapp
      ? await repository.findOne({
          where: { numeroWhatsapp: data.numeroWhatsapp },
        })
      : null;
    if (!cliente) {
      cliente = await repository.save(
        repository.create({ id: randomUUID(), ...data }),
      );
      console.log(`Cliente creado: ${cliente.nombre}`);
    }
    clientes[data.nombre] = cliente;
  }

  return clientes;
}

async function seedPedidos(
  dataSource: DataSource,
  productos: ProductoTypeormEntity[],
  clientes: Record<string, ClienteTypeormEntity>,
): Promise<void> {
  const pedidoRepository = dataSource.getRepository(PedidoTypeormEntity);

  const existentes = await pedidoRepository.count();
  if (existentes > 0) {
    return;
  }

  const porNombre = (nombre: string) =>
    productos.find(
      (producto) => producto.nombre === nombre,
    ) as ProductoTypeormEntity;

  const crearItems = (
    lista: { producto: ProductoTypeormEntity; cantidad: number }[],
  ) =>
    lista.map(({ producto, cantidad }) => {
      const item = new PedidoItemTypeormEntity();
      item.id = randomUUID();
      item.productoId = producto.id;
      item.nombreProducto = producto.nombre;
      item.precioUnitario = producto.precio;
      item.cantidad = cantidad;
      item.subtotal = Number(producto.precio) * cantidad;
      return item;
    });

  const pedidosSeed = [
    {
      canalOrigen: 'whatsapp' as const,
      estado: EstadoPedido.ENTREGADO,
      cliente: clientes['María Gómez'],
      items: crearItems([
        { producto: porNombre('Arroz Diana x 500g'), cantidad: 2 },
        { producto: porNombre('Leche Entera Alqueria 1L'), cantidad: 1 },
      ]),
    },
    {
      canalOrigen: 'whatsapp' as const,
      estado: EstadoPedido.DESPACHADO,
      cliente: clientes['Juan Pérez'],
      items: crearItems([
        { producto: porNombre('Queso Campesino'), cantidad: 1 },
        { producto: porNombre('Pan Tajado Bimbo'), cantidad: 2 },
      ]),
    },
    {
      canalOrigen: 'web' as const,
      estado: EstadoPedido.CONFIRMADO,
      cliente: clientes['Cliente Web'],
      items: crearItems([
        { producto: porNombre('Aceite Girasol 1L'), cantidad: 1 },
        { producto: porNombre('Azúcar Manuelita 1kg'), cantidad: 1 },
      ]),
    },
    {
      canalOrigen: 'whatsapp' as const,
      estado: EstadoPedido.PENDIENTE,
      cliente: clientes['María Gómez'],
      items: crearItems([
        { producto: porNombre('Sal Refisal 500g'), cantidad: 3 },
      ]),
    },
    {
      canalOrigen: 'web' as const,
      estado: EstadoPedido.EN_PREPARACION,
      cliente: clientes['Cliente Web'],
      items: crearItems([
        { producto: porNombre('Panela Redonda'), cantidad: 2 },
        { producto: porNombre('Arroz Diana x 500g'), cantidad: 1 },
      ]),
    },
    {
      canalOrigen: 'whatsapp' as const,
      estado: EstadoPedido.CANCELADO,
      cliente: clientes['Carlos Ruiz'],
      items: crearItems([
        { producto: porNombre('Mantequilla Ranchera'), cantidad: 1 },
      ]),
    },
  ];

  for (const data of pedidosSeed) {
    const total = data.items.reduce(
      (suma, item) => suma + Number(item.subtotal),
      0,
    );
    const pedido = new PedidoTypeormEntity();
    pedido.id = randomUUID();
    pedido.canalOrigen = data.canalOrigen;
    pedido.estado = data.estado;
    pedido.total = total;
    pedido.cliente = data.cliente;
    pedido.items = data.items;
    await pedidoRepository.save(pedido);
  }

  console.log(`${pedidosSeed.length} pedidos de muestra creados`);
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const dataSource = app.get(DataSource);

  const categorias = await seedCategorias(dataSource);
  await seedAdmin(dataSource);
  const productos = await seedProductos(dataSource, categorias);
  const clientes = await seedClientes(dataSource);
  await seedPedidos(dataSource, productos, clientes);

  await app.close();
  console.log('Seed completado');
}

bootstrap().catch((error) => {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});
