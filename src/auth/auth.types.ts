export interface JwtPayload {
  sub: string; //ID пользователя
  email: string; //Email пользователя
  roles: 'USER' | 'ADMIN'; //Роли пользователя
}
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}