import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY, PolicyRequirement } from '../decorators/check-policies.decorator';
import { ABAC_POLICIES } from '../abac/policies';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef // Permite buscar repositorios/servicios dinámicamente
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Obtener la regla requerida desde el decorador
    const policyReq = this.reflector.get<PolicyRequirement>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyReq) return true; // Si el endpoint no tiene el decorador, pasa libre

    const request = context.switchToHttp().getRequest();
    const user = request.user; // El usuario ya inyectado por tu JwtStrategy
    const { id: resourceId } = request.params; // Captura el ID de la URL (ej: /users/:id)

    if (!user) {
      throw new ForbiddenException('No autenticado para evaluar políticas.');
    }

    // 2. Obtener la función de política correspondiente
    const policyFn = ABAC_POLICIES[policyReq.resource]?.[policyReq.action];
    if (!policyFn) return true; // Si no hay regla estricta programada, por defecto pasa

    // 3. Buscar el recurso real en la base de datos dinámicamente para evaluar sus atributos
    let resourceEntity = null;
    if (resourceId) {
      resourceEntity = await this.fetchResource(policyReq.resource, resourceId);
    }

    // 4. Evaluar la regla ABAC
    const isAllowed = policyFn({ user, resource: resourceEntity });

    if (!isAllowed) {
      throw new ForbiddenException('No tienes los atributos necesarios para realizar esta acción');
    }

    return true;
  }

  // Método auxiliar para buscar el registro según el recurso solicitado
  private async fetchResource(resource: string, id: string) {
    try {
      // Aquí mapeas dinámicamente al servicio o repositorio correspondiente
      if (resource === 'user') {
        // Buscamos el servicio de usuarios dinámicamente desde el contenedor de NestJS
        const usersService = this.moduleRef.get('UsersService', { strict: false });
        return await usersService.findOne(id);
      }
      // Si añades himnos más adelante:
      // if (resource === 'himno') { ... }
      return null;
    } catch {
      throw new NotFoundException('El recurso que intentas evaluar no existe');
    }
  }
}