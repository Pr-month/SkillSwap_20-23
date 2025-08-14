import { ApiProperty } from '@nestjs/swagger';

export class SkillOwnerDto {
  @ApiProperty({
    description: 'ID владельца навыка',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'Имя владельца навыка',
    example: 'Иван Иванов',
  })
  name: string;

  @ApiProperty({
    description: 'Email владельца навыка',
    example: 'ivan@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Аватар владельца навыка',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string;
}

export class SkillCategoryDto {
  @ApiProperty({
    description: 'ID категории',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'Название категории',
    example: 'Программирование',
  })
  name: string;
}

export class SkillResponseDto {
  @ApiProperty({
    description: 'ID навыка',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'Название навыка',
    example: 'JavaScript разработка',
  })
  title: string;

  @ApiProperty({
    description: 'Описание навыка',
    example: 'Разработка веб-приложений на JavaScript',
  })
  description: string;

  @ApiProperty({
    description: 'Массив URL изображений навыка',
    example: ['https://example.com/image1.jpg'],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: 'Владелец навыка',
    type: SkillOwnerDto,
  })
  owner: SkillOwnerDto;

  @ApiProperty({
    description: 'Категория навыка',
    type: SkillCategoryDto,
  })
  category: SkillCategoryDto;
}

export class SkillsListResponseDto {
  @ApiProperty({
    description: 'Массив навыков',
    type: [SkillResponseDto],
  })
  data: SkillResponseDto[];

  @ApiProperty({
    description: 'Текущая страница',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    example: 5,
  })
  totalPage: number;
}

export class FavoriteSkillResponseDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 'uuid-v4-string',
  })
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  name: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'ivan@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Аватар пользователя',
    example: 'https://example.com/avatar.jpg',
  })
  avatar: string;

  @ApiProperty({
    description: 'Избранные навыки пользователя',
    type: [SkillResponseDto],
  })
  favoriteSkills: SkillResponseDto[];
}
