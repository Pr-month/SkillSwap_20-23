import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSkillDto {
  @ApiProperty({
    description: 'Название навыка',
    example: 'JavaScript разработка',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Описание навыка',
    example:
      'Разработка веб-приложений на JavaScript с использованием современных фреймворков',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Массив URL изображений навыка',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
    required: false,
  })
  @IsNotEmpty()
  @IsArray()
  images?: string[];

  @ApiProperty({
    description: 'ID категории навыка',
    example: 'uuid-v4-string',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;
}
