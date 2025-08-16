import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'ID родительской категории (если есть)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
