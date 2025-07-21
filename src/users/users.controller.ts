import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/password-update.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from '../auth/auth.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  //обновление пароля
  @UseGuards(AccessTokenGuard) // Защита эндпоинта
  @Patch('me/password') // Определение метода и пути
  @HttpCode(HttpStatus.NO_CONTENT) // Установка HTTP-статуса
  async updatePassword(
    @Req() req: AuthenticatedRequest, // Запрос с данными пользователя
    @Body() updatePasswordDto: UpdatePasswordDto, // Валидированные данные
  ) {
    const { sub: userId } = req.user; // Извлечение ID пользователя
    const { currentPassword, newPassword } = updatePasswordDto; // Получение паролей

    await this.usersService.updatePassword(
      // Вызов сервиса для обновления
      userId,
      currentPassword,
      newPassword,
    );
  }
}
