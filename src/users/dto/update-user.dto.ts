import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Gender } from '../entities/user.entity';

// еще должна быть about секция...
export class UpdateUserDto extends PartialType(CreateUserDto) {
  name: string;
  email: string;
  age: number;
  city: string;
  gender: Gender;
  avatar: string;
}
