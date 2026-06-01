import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { RoleSlug } from 'src/auth/models/role-slug.model';

export class RoleSlugDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsIn(Object.values(RoleSlug), {
    message: 'El rol debe ser estrictamente: ADMIN, EDITOR o USER',
  })
  role?: RoleSlug;
}
