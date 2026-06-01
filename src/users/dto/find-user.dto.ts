import { IsIn, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserStateFilter {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ALL = 'ALL',
}

export class FindUserDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === undefined || value === ''
      ? 'ACTIVE'
      : String(value).toUpperCase(),
  )
  @IsIn(Object.values(UserStateFilter), {
    message: 'El estado debe ser estrictamente: ACTIVE, INACTIVE o ALL',
  })
  state: string = 'ACTIVE';
}
