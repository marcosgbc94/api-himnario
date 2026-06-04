import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolesService } from './services/roles.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole]),
    forwardRef(() => UsersModule),
  ],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
