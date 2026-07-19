import { Admin } from '../entities/admin.entity';

export interface LoginResult {
  accessToken: string;
  user: Admin;
}

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResult>;
}

export const AUTH_SERVICE = Symbol('IAuthService');
