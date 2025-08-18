import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { Category } from '../entities/category.entity';
import { Skill } from '../../skills/entities/skill.entity';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    description: 'Новое название категории',
    example: 'Веб-разработка',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Родительская категория',
    type: () => Category,
  })
  @IsOptional()
  @IsUUID()
  parent?: Category;

  @ApiPropertyOptional({
    description: 'Дочерние категории',
    type: () => [Category],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Category)
  children?: Category[];

  @ApiPropertyOptional({
    description: 'Навыки в этой категории',
    type: () => [Skill],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Skill)
  skills?: Skill[];
}
