import { Role } from '../common/types';

export interface JwtPayload {
  sub: string; //ID пользователя
  email: string; //Email пользователя
  role?: Role; //Роли пользователя
}
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
