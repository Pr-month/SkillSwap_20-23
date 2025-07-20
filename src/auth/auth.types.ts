export interface JwtPayload {
  sub: string; //ID пользователя
  email: string; //Email пользователя
  roles: string[]; //Роли пользователя
}