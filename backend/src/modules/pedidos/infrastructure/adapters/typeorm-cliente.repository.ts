import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../../domain/entities/cliente.entity';
import { IClienteRepository } from '../../domain/ports/cliente.repository.port';
import { ClienteTypeormEntity } from '../entities/cliente.typeorm-entity';

@Injectable()
export class TypeormClienteRepository implements IClienteRepository {
  constructor(
    @InjectRepository(ClienteTypeormEntity)
    private readonly repository: Repository<ClienteTypeormEntity>,
  ) {}

  async findByWhatsapp(numeroWhatsapp: string): Promise<Cliente | null> {
    const entity = await this.repository.findOne({ where: { numeroWhatsapp } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(cliente: Cliente): Promise<Cliente> {
    const entity = new ClienteTypeormEntity();
    entity.id = cliente.id;
    entity.nombre = cliente.nombre;
    entity.numeroWhatsapp = cliente.numeroWhatsapp;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ClienteTypeormEntity): Cliente {
    return new Cliente(entity.id, entity.nombre, entity.numeroWhatsapp);
  }
}
