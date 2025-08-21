import { PartialType } from '@nestjs/mapped-types';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Gender } from '../../common/gender.enum';
import { User } from '../entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto extends PartialType(User) {
   @ApiProperty({
    description: 'UUID пользователя',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Алексей',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'alex@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Пароль (мин. 8 символов)',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

@ApiPropertyOptional({
    description: 'Дата рождения',
    example: '1990-01-01',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Город',
    example: 'Москва',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  city: string;

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
    description: 'О себе',
    example: 'Люблю программирование и спорт',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  about: string;

 @ApiPropertyOptional({
    description: 'URL аватара',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  }) 
  @IsOptional()
  @IsUrl()
  avatar?: string;

  
  @ApiPropertyOptional({
    description: 'Refresh token',
    example: 'refresh-token-string',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiPropertyOptional({
    description: 'Категории, которые пользователь хочет изучить',
    type: [Category],
    nullable: true,
  })
  @IsOptional()
  @Type(() => Category)
  wantToLearn?: Category[];
}
