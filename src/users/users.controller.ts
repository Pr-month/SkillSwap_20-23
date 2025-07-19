import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/me')
  findMe() {
    return this.usersService.findId(1);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findId(id);
  }
}
