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
import { Gender } from '../../common/gender.enum';
import { Skill } from '../../skills/entities/skill.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsOptional()
  @IsString()
  about?: string | null;

  @IsOptional()
  @IsDate()
  birthDate?: Date | null; // Разрешаем null

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  refreshToken: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Skill)
  favoriteSkills?: Skill[];
}
