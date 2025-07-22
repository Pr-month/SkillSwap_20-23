import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Gender } from 'src/common/gender.enum';
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
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @IsOptional()
  about: string;

  @IsOptional()
  @IsUrl()
  avatar: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
