import { SetMetadata } from '@nestjs/common';
import { RoleSlugEnum } from '../enums/role-slug.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleSlugEnum[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
