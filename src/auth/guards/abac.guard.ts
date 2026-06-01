import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CHECK_POLICIES_KEY,
  PolicyRequirement,
} from '../decorators/check-policies.decorator';
import { ABAC_POLICIES } from '../abac/policies';
import { ModuleRef } from '@nestjs/core';
import { Resource } from '../abac/abac.types';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef, // Permite buscar repositorios/servicios dinámicamente
  ) {}

  // Intercepta cada petición HTTP antes de que llegue a tu controlador,
  // decidiendo si el usuario tiene permiso para ejecutar la acción basándose en atributos (ABAC).
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyReq = this.reflector.get<PolicyRequirement>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyReq) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { id: resourceId } = request.params;

    if (!user) {
      throw new ForbiddenException('No autenticado para evaluar políticas.');
    }

    const policyFn = ABAC_POLICIES[policyReq.resource]?.[policyReq.action];
    if (!policyFn) return true;

    let resourceEntity = null;
    if (resourceId) {
      resourceEntity = await this.fetchResource(policyReq.resource, resourceId);
    }

    const isAllowed = policyFn({ user, resource: resourceEntity });

    if (!isAllowed) {
      throw new ForbiddenException(
        'No tienes los atributos necesarios para realizar esta acción',
      );
    }

    return true;
  }

  // Método auxiliar para buscar el registro según el recurso solicitado
  private async fetchResource(
    resource: Resource,
    id: string,
  ): Promise<any | null> {
    if (!id) {
      return null;
    }

    try {
      if (resource === Resource.USER) {
        const usersService = this.moduleRef.get('UsersService', { strict: false });

        return await usersService.findOne(id);
      }

      return null;
    } catch {
      return null;
    }
  }
}
