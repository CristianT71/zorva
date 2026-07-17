import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { TipoMovimiento } from '../../domain/entities/movimiento-inventario.entity';

@Entity('movimientos_inventario')
export class MovimientoInventarioTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'producto_id' })
  productoId: string;

  @Column({ type: 'varchar', length: 10 })
  tipo: TipoMovimiento;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'varchar', length: 255 })
  motivo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
