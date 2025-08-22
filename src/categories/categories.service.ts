import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  /**
   * Проверяет уникальность имени категории в рамках родительской категории
   * @param name - Проверяемое имя категории
   * @param parentId - ID родительской категории (null для корневых категорий)
   * @param excludeId - ID категории, которую следует исключить из проверки (актуально при обновлении)
   * @throws ConflictException - Если категория с таким именем уже существует
   */
  private async checkCategoryNameUnique(
    name: string,
    parentId: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name,
        parent: parentId ? { id: parentId } : IsNull(),
      },
    });

    if (existingCategory && existingCategory.id !== excludeId) {
      throw new ConflictException(
        `Category with name '${name}' already exists${
          parentId ? ' in this parent category' : ''
        }`,
      );
    }
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Проверяем уникальность имени
    await this.checkCategoryNameUnique(
      createCategoryDto.name,
      createCategoryDto.parentId || null,
    );

    const category = new Category(); //создаем новый экземпляр категории
    category.name = createCategoryDto.name; // устанавливаем имя категории из DTO

    // проверяем, указан ли parentId в DTO
    if (createCategoryDto.parentId) {
      // поиск родительской категории в базе данных
      const parent = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      // если родительская категория не найдена - выбрасываем исключение
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }
      category.parent = parent; // если родитель найден - устанавливаем связь
    }

    return await this.categoryRepository.save(category); // сохраняем категорию в базу данных и возвращаем результат
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

    // проверка на попытку сделать категорию родителем самой себя
    if (updateCategoryDto.parentId && updateCategoryDto.parentId === id) {
      throw new BadRequestException('Category cannot be parent of itself');
    }

    // Проверяем уникальность имени, если оно изменилось
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      await this.checkCategoryNameUnique(
        updateCategoryDto.name,
        updateCategoryDto.parentId || category.parent?.id || null,
        id,
      );
    }

    const updatedCategory = { ...category, ...updateCategoryDto };
    return await this.categoryRepository.save(updatedCategory);
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

  async getCategoryById(categoryId: string) {
    const returnedCategory = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!returnedCategory || returnedCategory.id != categoryId) {
      throw new BadRequestException(
        `Категория по указанному ID не была найдена: ${categoryId}`,
      );
    }
    return returnedCategory;
  }

  async getCategoriesByCategoryIDs(
    categoryIDs: string[] | undefined,
  ): Promise<Category[]> {
    let returnedCategories: Category[];

    if (categoryIDs) {
      returnedCategories = await Promise.all(
        categoryIDs.map(async (catId) => {
          const foundRepository = await this.categoryRepository.findOne({
            where: { id: catId },
          });
          if (!foundRepository) {
            throw new BadRequestException('Категория не была найдена');
          }
          return foundRepository;
        }),
      );
    } else {
      returnedCategories = [];
    }
    return returnedCategories;
  }
}
