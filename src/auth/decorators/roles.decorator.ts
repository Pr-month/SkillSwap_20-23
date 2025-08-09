import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/types';

export const ROLES_KEY = 'role';
export const HasRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
