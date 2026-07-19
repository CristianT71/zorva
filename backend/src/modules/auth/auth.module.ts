import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AUTH_REPOSITORY } from './domain/ports/auth.repository.port';
import { AUTH_SERVICE } from './domain/ports/auth.service.port';
import { JwtStrategy } from './infrastructure/adapters/jwt.strategy';
import { TypeormAdminRepository } from './infrastructure/adapters/typeorm-admin.repository';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AdminTypeormEntity } from './infrastructure/entities/admin.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminTypeormEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: AUTH_REPOSITORY, useClass: TypeormAdminRepository },
    { provide: AUTH_SERVICE, useClass: LoginUseCase },
  ],
  exports: [AUTH_REPOSITORY],
})
export class AuthModule {}
