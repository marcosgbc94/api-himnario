// src/core/roles/roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolesService } from './services/roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole]),
  ],
  providers: [
    RolesService,
  ],
  exports: [
    RolesService,
  ],
})
export class RolesModule {}