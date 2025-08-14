import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Category]),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenStrategy],
})
export class AuthModule {}
