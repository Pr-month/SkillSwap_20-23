import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FindSkillsQueryDto {
  @ApiProperty({
    description: 'Номер страницы для пагинации',
    example: '1',
    default: '1',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiProperty({
    description: 'Количество элементов на странице',
    example: '20',
    default: '20',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiProperty({
    description: 'Поисковый запрос по названию навыка',
    example: 'JavaScript',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Поиск по названию категории',
    example: 'Программирование',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
