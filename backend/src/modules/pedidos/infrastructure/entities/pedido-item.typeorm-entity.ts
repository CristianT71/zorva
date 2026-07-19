import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoTypeormEntity } from './pedido.typeorm-entity';

@Entity('pedido_items')
export class PedidoItemTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PedidoTypeormEntity, (pedido) => pedido.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoTypeormEntity;

  @Column({ type: 'uuid', name: 'producto_id' })
  productoId: string;

  @Column({ type: 'varchar', length: 150, name: 'nombre_producto' })
  nombreProducto: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'precio_unitario' })
  precioUnitario: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;
}
