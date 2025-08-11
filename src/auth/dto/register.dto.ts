import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Category } from '../../categories/entities/category.entity';
import { Gender } from '../../common/types';
import { Skill } from '../../skills/entities/skill.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'ivan@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя (минимум 6 символов)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Дата рождения пользователя',
    example: '1990-01-01',
    type: Date,
    required: false,
  })
  @IsDate()
  @IsOptional()
  birthDate?: Date;

  @ApiProperty({
    description: 'Пол пользователя',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  avatar?: string;

  @ApiProperty({
    description: 'Город проживания пользователя',
    example: 'Москва',
    required: false,
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Информация о пользователе',
    example: 'Это описание Иванова Ивана из Москвы.',
    required: false,
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({
    description: 'Категории навыков, которые пользователь хочет изучить',
    type: [Category],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Category)
  wantToLearn?: Category[];

  @ApiProperty({
    description: 'Навыки пользователя',
    type: [Skill],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Skill)
  skills?: Skill[];
}
