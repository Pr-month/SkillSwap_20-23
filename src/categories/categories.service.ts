import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository, IsNull } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new Category();
    category.name = createCategoryDto.name;

    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (parent) {
        category.parent = parent;
      }
    }

    return await this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOneOrFail({
      where: { id },
    });
    const newCategory = { ...category, ...updateCategoryDto };
    const updatedCategory = (await this.categoryRepository.save(
      newCategory,
    )) as Category;

    return updatedCategory;
  }

  async remove(id: string) {
    //поиск категории по ID и проверку ее существования
    const category = await this.categoryRepository.findOne({
      where: { id }, // условие поиска (ищем категорию с указанным ID)
      relations: ['skills'], //загружаем связанные сущности (все навыки, привязанные к этой категории)
    });

    //проверка существования категории
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // проверяем, есть ли связанные навыки
    if (category.skills && category.skills.length > 0) {
      throw new ForbiddenException(
        'Cannot delete category with associated skills',
      );
    }

    // удаляем категорию (каскадное удаление подкатегорий настроено в entity)
    return this.categoryRepository.delete(id);
  }
}
