import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration } from './config/configuration';
import { AppDataSource } from './config/data-source';
import { AuthModule } from './auth/auth.module';
import { AccessTokenStrategy } from './auth/strategies/access-token.strategy';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [configuration],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }),
    JwtModule.registerAsync({
      global: true, // Делаем модуль глобальным
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET') || 'defaultSecretKey',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '2h',
        },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forRoot(AppDataSource.options),
    UsersModule,
    AuthModule,
    UploadModule,
  ],
  providers: [AccessTokenStrategy],
})
export class AppModule {}
