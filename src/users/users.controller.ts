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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UpdatePasswordDto } from './dto/password-update.dto';
import { QueryParamsDto } from './dto/query-param.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список пользователей' })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Страница не найдена' })
  findAll(@Query() query: QueryParamsDto) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные текущего пользователя',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  getMe(@Request() req: AuthenticatedRequest) {
    return this.usersService.findUserById(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Неверный ID пользователя' })
  findOne(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  @Get('by-skill/:id')
  @ApiOperation({ summary: 'Найти пользователя по ID навыка' })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiResponse({
    status: 200,
    description: 'Владелец навыка',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Владелец навыка не найден' })
  async findBySkill(@Param('id') skillId: string) {
    return this.usersService.findUserBySkillId(skillId);
  }

  @Get('similar-skill/:id')
  @ApiOperation({
    summary: 'Найти пользователей, которые хотят изучить подобный навык',
  })
  @ApiParam({ name: 'id', description: 'UUID навыка' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: [User],
  })
  async findSimilarSkillOwnersById(@Param('id') skillId: string) {
    return this.usersService.findSimilarSkillOwnersBySkillId(skillId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Обновить данные текущего пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Данные пользователя обновлены',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 500, description: 'Ошибка при обновлении' })
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
  @ApiOperation({ summary: 'Обновить пароль текущего пользователя' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 204, description: 'Пароль успешно обновлен' })
  @ApiResponse({ status: 401, description: 'Не авторизован или неверный пароль' })
  @ApiResponse({ status: 400, description: 'Новый пароль не соответствует требованиям' })
  @ApiResponse({ status: 409, description: 'Новый пароль совпадает с текущим' })
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
