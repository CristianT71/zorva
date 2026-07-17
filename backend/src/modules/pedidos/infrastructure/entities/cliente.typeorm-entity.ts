import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('clientes')
export class ClienteTypeormEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 30,
    name: 'numero_whatsapp',
    nullable: true,
    unique: true,
  })
  numeroWhatsapp: string | null;
}
