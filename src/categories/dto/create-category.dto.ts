// Взято из ветки https://github.com/Pr-month/SkillSwap_20-23/blob/week2-andrey/src/categories/dto/create-category.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
