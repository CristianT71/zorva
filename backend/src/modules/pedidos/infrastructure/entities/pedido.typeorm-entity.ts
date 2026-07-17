import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { CanalOrigen } from '../../domain/entities/pedido.entity';
import { EstadoPedido } from '../../domain/value-objects/estado-pedido.vo';
import { ClienteTypeormEntity } from './cliente.typeorm-entity';
import { PedidoItemTypeormEntity } from './pedido-item.typeorm-entity';

@Entity('pedidos')
export class PedidoTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, name: 'canal_origen' })
  canalOrigen: CanalOrigen;

  @Column({ type: 'varchar', length: 20, default: EstadoPedido.PENDIENTE })
  estado: EstadoPedido;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => ClienteTypeormEntity, { eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: ClienteTypeormEntity;

  @OneToMany(() => PedidoItemTypeormEntity, (item) => item.pedido, {
    eager: true,
    cascade: true,
  })
  items: PedidoItemTypeormEntity[];
}
