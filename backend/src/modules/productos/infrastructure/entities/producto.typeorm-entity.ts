import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CategoriaTypeormEntity } from './categoria.typeorm-entity';

@Entity('productos')
export class ProductoTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @ManyToOne(() => CategoriaTypeormEntity, { eager: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: CategoriaTypeormEntity;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precio: number;

  @Column({ type: 'varchar', length: 50, name: 'unidad_medida' })
  unidadMedida: string;

  @Column({ type: 'int', name: 'stock_actual', default: 0 })
  stockActual: number;

  @Column({ type: 'int', name: 'stock_minimo', default: 0 })
  stockMinimo: number;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
