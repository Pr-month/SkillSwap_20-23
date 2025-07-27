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
import { UpdateCategoryDto } from './dto/update-category.dto';
import { HasRoles } from 'src/auth/decorators/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/common/types';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @HasRoles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
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
