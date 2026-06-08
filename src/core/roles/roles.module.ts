import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolesService } from './services/roles.service';
import { UsersModule } from '../users/users.module';
import { RolesController } from './controllers/roles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole]),
    forwardRef(() => UsersModule),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
