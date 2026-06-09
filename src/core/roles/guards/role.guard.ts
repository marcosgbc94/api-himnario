import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RoleSlugEnum } from '../enums/role-slug.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleSlugEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si el endpoint no tiene el decorador @Roles, significa que es público para cualquier usuario autenticado
    if (!requiredRoles) {
      return true;
    }

    // Obtiene el usuario desde el request (inyectado previamente por el AuthGuard('jwt'))
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.userRoles) {
      throw new ForbiddenException(
        'Permiso denegado para acceder a este recurso',
      );
    }

    // Evalúa matemáticamente si el usuario tiene al menos uno de los roles requeridos
    const hasRole = requiredRoles.some((role) => {
      return user.userRoles.some((userRole) => {
        return userRole.role.slug === role;
      });
    });

    if (!hasRole) {
      throw new ForbiddenException(
        'Permiso denegado para realizar esta acción',
      );
    }

    return true;
  }
}
