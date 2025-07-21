import { User } from '../../users/entities/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class signInDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class returnSignInDto {
  user: User;
  @IsString()
  accessToken: string;
  @IsString()
  refreshToken: string;
}
