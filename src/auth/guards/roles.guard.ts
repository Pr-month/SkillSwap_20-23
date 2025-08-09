import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../../common/types';
import { AuthenticatedRequest } from '../auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // console.log(requiredRoles);
    if (!requiredRoles || requiredRoles.length === 0) {
      // console.log('Нет ограничений! ');
      return true;
    }
    try {
      const request: AuthenticatedRequest = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user) {
        // console.log('Пользователь не определен!');
        // console.log('Request:', request);
        // console.log('Request user:', request.user);
        return false;
      }
      //console.group(user)
      return requiredRoles.some((role) => user.role?.includes(role));
    } catch {
      // console.error('Ошибка в RolesGuard:', error);
      return false;
    }
  }
}

/*
ПРИМЕР ПРИМЕНЕНИЯ: 



  @HasRoles(Role.ADMIN)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Get('me')
  getMe(@Request() req: AuthenticatedRequest) {
    console.log(req.user);
    return this.usersService.findUserById(req.user.sub);
  }
*/
