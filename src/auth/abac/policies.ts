import { Action, Resource, PolicyFn } from './abac.types';
import { RoleSlug } from '../models/role-slug.model';

export const ABAC_POLICIES: Record<
  Resource,
  Partial<Record<Action, PolicyFn>>
> = {
  [Resource.USER]: {
    [Action.CREATE]: ({ user }) => {
      return user.roles.includes(RoleSlug.ADMIN) || user.roles.includes(RoleSlug.EDITOR);
    },

    [Action.READ]: ({ user }) => {
      return user.roles.includes(RoleSlug.ADMIN) || user.roles.includes(RoleSlug.EDITOR);
    },

    [Action.UPDATE]: ({ user, resource }) => {
      if (user.roles.includes(RoleSlug.ADMIN)) return true;
      return resource && user.sub === resource.id; 
    },

    [Action.DELETE]: ({ user }) => {
      return user.roles.includes(RoleSlug.ADMIN);
    },
  },
};
