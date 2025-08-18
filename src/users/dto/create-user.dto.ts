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

export class CreateUserDto extends PartialType(User) {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsString()
  @IsOptional()
  about: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @Type(() => Category)
  wantToLearn?: Category[];
}
