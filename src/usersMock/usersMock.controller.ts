// ЭТОТ ФАЙЛ СЛЕДУЕТ УДАЛИТЬ
import { Controller } from '@nestjs/common';
import { UsersService } from './usersMock.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
