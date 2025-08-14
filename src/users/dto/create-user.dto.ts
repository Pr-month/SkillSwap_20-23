import { PartialType } from '@nestjs/mapped-types';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Gender } from '../../common/gender.enum';
import { User } from '../entities/user.entity';

export class CreateUserDto extends PartialType(User) {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
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
}
