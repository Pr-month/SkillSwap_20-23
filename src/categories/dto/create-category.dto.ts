import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, {
    message: 'Длина названия категории не может превышать 100 символов',
  })
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
