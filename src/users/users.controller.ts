import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { UpdatePasswordDto } from './dto/password-update.dto';
import { QueryParamsDto } from './dto/query-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryParamsDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@Request() req: AuthenticatedRequest) {
    console.log(req.user);
    return this.usersService.findUserById(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get('by-skill/:id')
  async findBySkill(@Param('id') skillId: string) {
    return this.usersService.findUserBySkillId(skillId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  async updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUserById(
      req.user.sub, // ID пользователя
      updateUserDto,
    );
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
