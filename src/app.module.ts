import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenStrategy } from './auth/strategies/accessToken.strategies';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true, // Делаем модуль глобальным
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'defaultSecretKey',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '2h',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    AuthModule,
  ],

  controllers: [AppController],
  providers: [AppService, AccessTokenStrategy],
})
export class AppModule {}
