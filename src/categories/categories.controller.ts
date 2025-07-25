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
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { AuthenticatedRequest } from '../auth/auth.types';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  /*@Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }*/

  // удаление категории
  @Delete(':id') // определение метода DELETE и пути с параметром :id
  @UseGuards(AccessTokenGuard) // защита эндпоинта JWT-аутентификацией
  async remove(
    @Param('id') id: string, // извлечение ID категории из URL-параметра
    @Req() req: AuthenticatedRequest // запрос с данными аутентифицированного пользователя
  ) {
     // вызов сервиса для удаления категории
    return this.categoriesService.remove( 
      id,  // ID категории для удаления
      req.user // данные пользователя (JWT payload)
    );
  }
}
