import { SetMetadata } from '@nestjs/common';
import { RoleSlug } from '../models/role-slug.model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleSlug[]) => SetMetadata(ROLES_KEY, roles);
