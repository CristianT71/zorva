import { Admin } from '../entities/admin.entity';

export interface IAuthRepository {
  findByEmail(email: string): Promise<Admin | null>;
}

export const AUTH_REPOSITORY = Symbol('IAuthRepository');
