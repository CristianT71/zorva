import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../../domain/ports/auth.service.port';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() dto: LoginDto) {
    const { accessToken, user } = await this.authService.login(
      dto.email,
      dto.password,
    );
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}
