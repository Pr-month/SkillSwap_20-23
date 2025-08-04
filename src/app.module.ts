import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccessTokenStrategy } from './auth/strategies/access-token.strategy';
import { UploadModule } from './upload/upload.module';
import { SkillsModule } from './skills/skills.module';
import { CategoriesModule } from './categories/categories.module';
import { WinstonLogger } from './logger/winston-logger';
import { RequestsModule } from './requests/requests.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationsModule } from './notifications/notifications.module';
import { appConfig } from './config/app.config';
import { dbConfig } from './config/db.config';
import { jwtConfig } from './config/jwt.config';
import { postgresConfig } from './config/db.config';
import { pgAdminConfig } from './config/db.config';
import { IJwtConfig } from './config/config.types';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [appConfig, dbConfig, jwtConfig, postgresConfig, pgAdminConfig],
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env',
    }),
    JwtModule.registerAsync({
      global: true, // Делаем модуль глобальным
      imports: [ConfigModule],
      inject: [jwtConfig.KEY],
      useFactory: (config: IJwtConfig) => ({
        secret: config.accessSecret,
        signOptions: {
          expiresIn: config.accessExpiration,
        },
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*', '/upload*'],
      serveStaticOptions: {
        index: false,
      },
      serveRoot: '/public',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [dbConfig.KEY],
      useFactory: (config: DataSourceOptions) => config,
    }),
    UsersModule,
    AuthModule,
    UploadModule,
    SkillsModule,
    CategoriesModule,
    RequestsModule,
    NotificationsModule,
  ],
  providers: [
    AccessTokenStrategy,
    { provide: WinstonLogger, useFactory: () => new WinstonLogger() }, //WinstonLogger регистрируется через фабрику, что дает больше гибкости при создании экземпляра
  ],
  exports: [WinstonLogger], //для использования в других модулях
})
export class AppModule {}
