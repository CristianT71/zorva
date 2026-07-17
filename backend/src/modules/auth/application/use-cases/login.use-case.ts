import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../../domain/ports/auth.repository.port';
import {
  type IAuthService,
  type LoginResult,
} from '../../domain/ports/auth.service.port';

@Injectable()
export class LoginUseCase implements IAuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const admin = await this.authRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: admin.id,
      email: admin.email,
      rol: admin.rol,
    });

    return { accessToken, user: admin };
  }
}
