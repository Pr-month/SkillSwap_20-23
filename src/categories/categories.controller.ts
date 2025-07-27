import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../common/types';
import { HasRoles } from '../auth/decorators/roles.decorator';

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
  @HasRoles(Role.ADMIN) // только для админов
  @UseGuards(AccessTokenGuard, RolesGuard) // защита эндпоинта JWT-аутентификацией
  async remove(@Param('id') id: string) {
     return this.categoriesService.remove(id);
  }
}
