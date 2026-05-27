import { Action, Resource, PolicyFn } from './abac.types';

export const ABAC_POLICIES: Record<Resource, Partial<Record<Action, PolicyFn>>> = {
  [Resource.HIMNO]: {
    [Action.UPDATE]: ({ user, resource }) => {
      // 💡 REGLA ABAC: Verificamos si en su lista de roles tiene 'admin' o 'editor'
      const hasPrivilegedRole = user.roles.some(role => 
        role === UserRole.ADMIN || role === UserRole.EDITOR
      );

      if (hasPrivilegedRole) return true;

      // Si no tiene esos roles, se aplica la regla de dueño del recurso
      return resource.createdBy === user.sub;
    },
    
    [Action.DELETE]: ({ user }) => {
      // Solo si el array contiene 'admin'
      return user.roles.includes(UserRole.ADMIN);
    },
  },
};