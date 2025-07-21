import { Type } from 'class-transformer';
import { Gender } from '../entities/user.entity';
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsNumber()
  age: number;
  @IsString()
  city: string;
  @IsString()
  about: string;
  @IsString()
  gender: Gender;
  @IsString()
  avatar: string;
}

export class RequestUserDTO {
  @IsString()
  userId: string; //ID пользователя
  @IsEmail()
  email: string; //Email пользователя
  @IsArray()
  roles: string[]; //Роли пользователя
}

export class RequestWithGuardDTO extends Request {
  @ValidateNested()
  @Type(() => RequestUserDTO)
  user: RequestUserDTO;
}
