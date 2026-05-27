export enum UsersStateFilter {
  ACTIVES = 'ACTIVES',
  INACTIVES = 'INACTIVAS',
  ALL = 'ALL'
}

export interface FindUsersDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '') ? 'ACTIVES' : value.toUpperCase())
  @IsIn(UsersStateFilter, {
    message: 'El estado debe ser estrictamente: ACTIVES, INACTIVES o ALL'
  })
  state: string = "ACTIVES";
}
