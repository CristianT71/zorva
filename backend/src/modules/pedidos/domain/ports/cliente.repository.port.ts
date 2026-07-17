import { Cliente } from '../entities/cliente.entity';

export interface IClienteRepository {
  findByWhatsapp(numeroWhatsapp: string): Promise<Cliente | null>;
  save(cliente: Cliente): Promise<Cliente>;
}

export const CLIENTE_REPOSITORY = Symbol('IClienteRepository');
