import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([UserRepository])],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, UserRepository],
})
export class UsersModule {}
