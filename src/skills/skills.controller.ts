import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { returnErrorDTO } from '../auth/dto/returnErrorDTO';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateSkillDto } from './dto/create-skill.dto';
import { FindSkillsQueryDto } from './dto/find-skills.dto';
import {
  FavoriteSkillResponseDto,
  SkillResponseDto,
  SkillsListResponseDto,
} from './dto/skill-response.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список навыков',
    description:
      'Возвращает список навыков с возможностью поиска, фильтрации и пагинации',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Количество элементов на странице',
    example: '20',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Поиск по названию навыка',
    example: 'JavaScript',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Поиск по категории',
    example: 'Программирование',
  })
  @ApiResponse({
    status: 200,
    description: 'Список навыков успешно получен',
    type: SkillsListResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Страница не найдена',
    type: returnErrorDTO,
  })
  findAll(@Query() query: FindSkillsQueryDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить навык по ID',
    description:
      'Возвращает детальную информацию о навыке по его идентификатору',
  })
  @ApiParam({
    name: 'id',
    description: 'ID навыка',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно найден',
    type: SkillResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Навык не найден',
    type: returnErrorDTO,
  })
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать новый навык',
    description: 'Создает новый навык для текущего пользователя',
  })
  @ApiBody({
    type: CreateSkillDto,
    description: 'Данные для создания навыка',
  })
  @ApiResponse({
    status: 201,
    description: 'Навык успешно создан',
    type: SkillResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные для создания навыка',
    type: returnErrorDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не аутентифицирован',
    type: returnErrorDTO,
  })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createSkillDto: CreateSkillDto,
  ) {
    return this.skillsService.create(req.user.sub, createSkillDto);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить навык',
    description:
      'Обновляет существующий навык (только владелец может обновлять)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID навыка для обновления',
    example: 'uuid-v4-string',
  })
  @ApiBody({
    type: UpdateSkillDto,
    description: 'Данные для обновления навыка',
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно обновлен',
    type: SkillResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные для обновления',
    type: returnErrorDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не аутентифицирован',
    type: returnErrorDTO,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для обновления навыка',
    type: returnErrorDTO,
  })
  @ApiNotFoundResponse({
    description: 'Навык не найден',
    type: returnErrorDTO,
  })
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.sub);
  }

  @Post(':id/favorite')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Добавить навык в избранное',
    description: 'Добавляет навык в список избранных навыков пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'ID навыка для добавления в избранное',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно добавлен в избранное',
    type: FavoriteSkillResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Навык уже в избранном',
    type: returnErrorDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не аутентифицирован',
    type: returnErrorDTO,
  })
  @ApiNotFoundResponse({
    description: 'Навык не найден',
    type: returnErrorDTO,
  })
  addFavorite(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.skillsService.addFavorite(req.user.sub, id);
  }

  @Delete(':id/favorite')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Убрать навык из избранного',
    description: 'Удаляет навык из списка избранных навыков пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'ID навыка для удаления из избранного',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно удален из избранного',
    type: FavoriteSkillResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Навык не найден в избранном',
    type: returnErrorDTO,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не аутентифицирован',
    type: returnErrorDTO,
  })
  @ApiNotFoundResponse({
    description: 'Навык не найден',
    type: returnErrorDTO,
  })
  removeFavorite(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.skillsService.removeFavorite(req.user.sub, id);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить навык',
    description: 'Удаляет навык (только владелец может удалять)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID навыка для удаления',
    example: 'uuid-v4-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Навык успешно удален',
    type: SkillResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не аутентифицирован',
    type: returnErrorDTO,
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав для удаления навыка',
    type: returnErrorDTO,
  })
  @ApiNotFoundResponse({
    description: 'Навык не найден',
    type: returnErrorDTO,
  })
  @ApiBadRequestResponse({
    description: 'Навык не имеет владельца',
    type: returnErrorDTO,
  })
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.skillsService.remove(req.user.sub, id);
  }
}
