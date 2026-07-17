export type RolAdmin = 'admin' | 'operador';

export class Admin {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly rol: RolAdmin,
  ) {}
}
