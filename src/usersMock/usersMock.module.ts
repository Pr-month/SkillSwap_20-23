// ЭТОТ ФАЙЛ СЛЕДУЕТ УДАЛИТЬ
import { Module } from '@nestjs/common';
import { UsersService } from './usersMock.service';
import { UsersController } from './usersMock.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
