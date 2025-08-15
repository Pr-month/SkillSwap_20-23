import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/types';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from './entities/request.entity';

@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiBearerAuth()
  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({
    summary: 'Создать новый запрос обмена навыками',
    description: 'Создает новый запрос обмена навыками между пользователями'
  })
  @ApiBody({
    type: CreateRequestDto,
    description: 'Данные для создания запроса'
  })
  @ApiResponse({
    status: 201,
    description: 'Запрос успешно создан',
    type: Request,
    content: {
      'application/json': {
        example: [new Request()]
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Неверные параметры запроса'
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован'
  })
  @ApiResponse({
    status: 403,
    description: 'У пользователя нет прав на создание запроса'
  })
  @ApiResponse({
    status: 404,
    description: 'Указанный навык не найден'
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера'
  })
  async create(
    @Body() createRequestDto: CreateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.create(createRequestDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Получить список всех запросов',
    description: 'Возвращает список всех запросов'
  })
  @ApiResponse({
    status: 200,
    description: 'Список запросов',
    type: Request,
    isArray: true,
    content: {
      'application/json': {
        example: [new Request()]
    }}
  })
  @ApiResponse({
    status: 401,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: 500,
    description: 'Внутренняя ошибка сервера',
  })
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('incoming')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список входящих запросов' })
  @ApiResponse({
    status: 200,
    description: 'Список входящих запросов',
    type: Request,
    isArray: true,
    content: {
      'application/json': {
        example: [new Request()]
    }}
  })
  @UseGuards(AccessTokenGuard)
  findIncoming(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findIncoming(req.user.sub);
  }

  @Get('outgoing')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Список исходящих запросов',
    type: Request,
    isArray: true,
    content: {
      'application/json': {
        example: [new Request()]
    }}
  })
  @ApiOperation({ summary: 'Получить список исходящих запросов' })
  @UseGuards(AccessTokenGuard)
  findOutgoing(@Req() req: AuthenticatedRequest) {
    return this.requestsService.findOutgoing(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить запрос по ID' })
  @ApiResponse({
    status: 200,
    description: 'Запрос полученный по ID',
    type: Request,
    content: {
      'application/json': {
        example: new Request()
    }}
  })
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить запрос по ID' })
  @ApiBody({
    type: UpdateRequestDto,
    description: 'Данные для создания запроса'
  })

  @ApiResponse({
    status: 200,
    description: 'Обновление запроса по ID',
    type: Request,
    content: {
      'application/json': {
        example: new Request()
    }}
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER) // Только админ или пользователь
  update(
    @Param('id') id: string,
    @Body() updateRequestDto: UpdateRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.requestsService.update(id, updateRequestDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Удаление запроса по ID',
    type: Request,
    isArray: true,
  })
  @ApiOperation({ summary: 'Удалить запрос по ID' })
  @UseGuards(AccessTokenGuard, RolesGuard)
  remove(@Req() req: AuthenticatedRequest, @Param('id') requestId: string) {
    return this.requestsService.remove(req.user.sub, requestId);
  }
}
