export enum UserStateFilter {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ALL = 'ALL'
}

export interface FindUserDto {
    @IsOptional()
    @Transform(({ value }) => (value === undefined || value === '') ? 'ACTIVES' : value.toUpperCase())
    @IsIn(UserStateFilter, {
        message: 'El estado debe ser estrictamente: ACTIVE, INACTIVE o ALL'
    })
    state: string = "ACTIVE";
}
  