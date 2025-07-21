import {
  Controller,
  Request,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RequestWithGuard, UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { UpdatePasswordDto } from './dto/password-update.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: RequestWithGuardDTO) {
    const currentUser = await this.usersService.findUserById(req.user.userId);
    return currentUser;
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Request() req: RequestWithGuard) {
    const currentUser = await this.usersService.findId(req.user.userId);
    return currentUser;
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  async updateMe(
    @Request() req: RequestWithGuardDTO,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      console.log(req.user);
      const response = await this.usersService.updateUserById(
        req.user.userId, // ID пользователя
        updateUserDto,
      );
      return response;
    } catch {
      throw new BadRequestException('Ошибка при обновлении пользователя');
    }
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
