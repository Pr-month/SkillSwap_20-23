import { Injectable } from '@nestjs/common';
// import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    console.log(updateCategoryDto);
    // Поскольку пароль и рефереш токен надо выкинуть оставлю здесь эту линию

    const category = await this.categoryRepository.findOneOrFail({
      where: { id },
    });
    const newCategory = { ...category, ...updateCategoryDto };
    const updatedCategory = (await this.categoryRepository.save(
      newCategory,
    )) as Category;

    return updatedCategory;
  }
}
