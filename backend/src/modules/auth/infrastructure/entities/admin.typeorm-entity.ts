import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { RolAdmin } from '../../domain/entities/admin.entity';

@Entity('admins')
export class AdminTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'admin' })
  rol: RolAdmin;
}
