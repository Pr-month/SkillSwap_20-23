export interface JwtPayload {
  sub: string; //ID пользователя
  email: string; //Email пользователя
<<<<<<< HEAD
  roles: 'USER' | 'ADMIN'; //Роли пользователя
}
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
=======
  roles: string[]; //Роли пользователя
}
>>>>>>> week1
