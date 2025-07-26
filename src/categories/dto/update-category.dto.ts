import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { Category } from '../entities/category.entity';
import { Skill } from 'src/skills/entities/skill.entity';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  id: string;
  name: string;
  parent?: Category;
  children?: Category[];
  skills?: Skill[];
}
