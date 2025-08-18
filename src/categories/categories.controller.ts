import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/types';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories') // Группировка всех методов контроллера под тегом "Categories"
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Создать новую категорию' })
  @ApiBearerAuth('JWT-auth') // Указываем, что метод требует авторизации
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({
    status: 409,
    description: 'Категория с таким именем уже существует',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Данные для создания категории',
  })
  @HasRoles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiOperation({ summary: 'Получить все корневые категории' })
  @ApiResponse({
    status: 200,
    description: 'Список корневых категорий',
    type: [Category],
  })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID категории для обновления',
    type: String,
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Данные для обновления категории',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Неверные входные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @ApiResponse({
    status: 409,
    description: 'Категория с таким именем уже существует',
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }
  // удаление категории
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID категории для удаления',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Категория успешно удалена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Нет прав доступа или есть связанные навыки',
  })
  @ApiResponse({ status: 404, description: 'Категория не найдена' })
  @Delete(':id') // определение метода DELETE и пути с параметром :id
  @HasRoles(Role.ADMIN) // только для админов
  @UseGuards(AccessTokenGuard, RolesGuard) // защита эндпоинта JWT-аутентификацией
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
