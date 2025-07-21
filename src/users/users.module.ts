import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/users.entity';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserRepository],
  imports: [ConfigModule, TypeOrmModule.forFeature([UserRepository])],
  controllers: [UsersController],
  exports: [UsersService, UserRepository], // Важно экспортировать репозиторий
  providers: [UsersService, ConfigService, UserRepository],
})
export class UsersModule {}
