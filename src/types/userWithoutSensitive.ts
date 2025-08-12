import { Gender } from '../common/gender.enum';
import { Role } from '../common/types';

export interface IUserWithoutSensitive {
  id: string;
  name: string;
  email: string;
  age: number;
  city: string;
  gender: Gender;
  avatar: string;
  about: string | null;
  role: Role;
}
