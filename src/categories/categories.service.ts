import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { JwtPayload } from '../auth/auth.types';
import { Role } from '../common/types';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) 
    //private skillRepository: Repository<Category>, 
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    console.log(createCategoryDto);
    return 'This action adds a new category';
  }

  findAll() {
    return `This action returns all categories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    console.log(updateCategoryDto);
    return `This action updates a #${id} category`;
  }

  /*remove(id: number) {
    return `This action removes a #${id} category`;
  }*/

  async remove(id: string, user: JwtPayload) {
    // Проверяем, является ли пользователь администратором
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admin can delete categories');
    }

    //поиск категории по ID и проверку ее существования
    const category = await this.categoryRepository.findOne({ 
      where: { id }, // условие поиска (ищем категорию с указанным ID)
      relations: ['skills'] //загружаем связанные сущности (все навыки, привязанные к этой категории)
    });

    //проверка существования категории
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Проверяем, есть ли связанные навыки
    if (category.skills && category.skills.length > 0) {
      throw new ForbiddenException('Cannot delete category with associated skills');
    }

    // Удаляем категорию (каскадное удаление подкатегорий настроено в entity)
    return this.categoryRepository.delete(id);
  }
}
