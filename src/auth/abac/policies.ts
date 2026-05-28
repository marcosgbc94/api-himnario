import { UserRole } from 'src/users/entities/user.entity';
import { Action, Resource, PolicyFn } from './abac.types';

export const ABAC_POLICIES: Record<
  Resource,
  Partial<Record<Action, PolicyFn>>
> = {
  [Resource.USER]: {
    [Action.CREATE]: ({ user }) => {
      return user.roles.includes('admin') || user.roles.includes('editor');
    },
    
    [Action.READ]: ({ user, resource }) => {
      // 💡 Como es un GET general, 'resource' viene null.
      // Evaluamos puramente los atributos de quien hace la petición.
      return user.roles.includes('admin') || user.roles.includes('editor');
    },
    
    [Action.UPDATE]: ({ user, resource }) => {
      if (user.roles.includes('admin')) return true;
      // Aquí SÍ hay recurso porque el endpoint tiene un :id (ej: /users/:id)
      return resource && user.sub === resource.id; 
    },
    
    [Action.DELETE]: ({ user }) => {
      return user.roles.includes('admin');
    },
  },
};