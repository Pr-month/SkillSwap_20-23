import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Gender } from 'src/common/gender.enum';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  about?: string | null; // Разрешаем null;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(100)
  age?: number | null; // Разрешаем null

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  refreshToken: string;
}
