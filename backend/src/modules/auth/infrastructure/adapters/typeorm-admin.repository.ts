import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../domain/entities/admin.entity';
import { IAuthRepository } from '../../domain/ports/auth.repository.port';
import { AdminTypeormEntity } from '../entities/admin.typeorm-entity';

@Injectable()
export class TypeormAdminRepository implements IAuthRepository {
  constructor(
    @InjectRepository(AdminTypeormEntity)
    private readonly repository: Repository<AdminTypeormEntity>,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: AdminTypeormEntity): Admin {
    return new Admin(
      entity.id,
      entity.nombre,
      entity.email,
      entity.passwordHash,
      entity.rol,
    );
  }
}
