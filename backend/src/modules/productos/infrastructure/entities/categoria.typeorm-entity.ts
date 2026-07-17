import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias')
export class CategoriaTypeormEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;
}
