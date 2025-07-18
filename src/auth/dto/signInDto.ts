// import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/usersMock/usersMock.service';

export class signInDto {
  username: string;
  password: string;
}

export class returnSignInDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class returnErrorDTO {
  error: string;
}

//Tokens

export class getTokensDTO {
  username: string;
  userId: string;
  userEmail: string;
  userRole: string;
}

export class returnGetTokensDTO {
  accessToken: string;
  refreshToken: string;
}
