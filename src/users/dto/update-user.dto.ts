import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Gender } from '../../common/gender.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  name: string;
  email: string;
  age: number;
  city: string;
  about: string;
  gender: Gender;
  avatar: string;
}
