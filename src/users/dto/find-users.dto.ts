import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export enum UsersStateFilter {
  ACTIVES = 'ACTIVES',
  INACTIVES = 'INACTIVES',
  ALL = 'ALL',
}

export class FindUsersDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '') ? 'ACTIVES' : value.toUpperCase())
  @IsIn(Object.values(UsersStateFilter), {
    message: 'El estado debe ser estrictamente: ACTIVES, INACTIVES o ALL'
  })
  state: string = 'ACTIVES';
}
