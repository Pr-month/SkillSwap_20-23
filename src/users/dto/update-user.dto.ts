import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../../common/gender.enum';
import { Skill } from '../../skills/entities/skill.entity';
import { ApiPropertyOptional  } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Имя пользователя',
    example: 'Алексей',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email пользователя',
    example: 'alex@example.com',
  })
  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @ApiPropertyOptional({
    description: 'О себе',
    example: 'Люблю программирование и спорт',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  about?: string | null;

  
  @ApiPropertyOptional({
    description: 'Дата рождения',
    example: '1990-01-01',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  birthDate?: Date | null; // Разрешаем null

  @ApiPropertyOptional({
    description: 'Город',
    example: 'Москва',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional({
    description: 'Пол',
    enum: Gender,
    example: Gender.MALE,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'URL аватара',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Refresh token',
    example: 'refresh-token-string',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  refreshToken: string;

  @ApiPropertyOptional({
    description: 'Любимые навыки',
    type: [Skill],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Skill)
  favoriteSkills?: Skill[];

   @ApiPropertyOptional({
    description: 'Категории навыков, которые пользователь хочет изучить',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  wantToLearn?: string[];
}
