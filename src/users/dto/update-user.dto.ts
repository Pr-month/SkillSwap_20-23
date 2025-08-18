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
import { ApiProperty } from '@nestjs/swagger';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { Category } from '../../categories/entities/category.entity';

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

  // @ApiProperty({
  //   description: 'Категории навыков, которые пользователь хочет изучить',
  //   type: [UUID],
  //   required: false,
  // })
  // @IsOptional()
  // @IsArray()
  // @IsUUID('all', { each: true })
  // wantToLearn?: string[];

  @ApiProperty({
    description: 'Категории навыков, которые пользователь хочет изучить',
    type: [UUID],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Category)
  wantToLearn?: Category[];
}

export class UpdateMeDto {
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

  @ApiProperty({
    description: 'Категории навыков, которые пользователь хочет изучить',
    type: [UUID],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  wantToLearn?: string[];
}
