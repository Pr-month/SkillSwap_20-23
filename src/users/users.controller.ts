import {
  Controller,
  Request,
  Get,
  Body,
  Patch,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @UseGuards(AuthGuard) //TO DO: Здесь должен быть Auth Guard
  @Get('me')
  getMe(@Request() req) {
    const currentUser = this.usersService.findUserById(req.id);
    return currentUser;
  }

  @Patch(':id')
  async upadteUserById(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const response = await this.usersService.updateUserById(
        id,
        updateUserDto,
      );
      return response;
    } catch {
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }

  @UseGuards(AuthGuard) //TO DO: Здесь должен быть Auth Guard
  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      const response = await this.usersService.updateUserById(
        req.id,
        updateUserDto,
      );
      return response;
    } catch {
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
  }
}
