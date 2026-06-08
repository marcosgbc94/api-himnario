import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Roles } from '../decorators/roles.decorator';
import { RoleSlugEnum } from '../enums/role-slug.enum';
import { RolesGuard } from '../guards/role.guard';
import { RolesService } from '../services/roles.service';
import { AuditAction } from '../../audit/decorators/audit.decorator';
import { AuditActionEnum } from '../../audit/enums/AuditAction.enum';
import { AssignRoleDTO } from '../dto/assing-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ summary: 'Asigna un rol a un usuario determinado' })
  @ApiResponse({ status: 200, description: 'Rol asignado con éxito' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya tiene ese rol asignado',
  })
  @ApiResponse({ status: 500, description: 'Error al asignar el rol' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleSlugEnum.ADMIN)
  @AuditAction(AuditActionEnum.ROLE_ASSIGN)
  @Post('roles/:userId')
  assignRoleToUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: AssignRoleDTO,
    @Req() req: any,
  ) {
    const executorId = req.user.id || req.user.sub;
    return this.rolesService.assignRole(userId, body.roleSlug, executorId);
  }

  @ApiOperation({ summary: 'Quita un rol a un usuario determinado' })
  @ApiResponse({ status: 200, description: 'Rol fue desasignado con éxito' })
  @ApiResponse({
    status: 409,
    description: 'El usuario no tiene ese rol asignado',
  })
  @ApiResponse({ status: 500, description: 'Error al desasignar el rol' })
  @ApiQuery({
    name: 'roleSlug',
    enum: RoleSlugEnum,
    description: 'Slug del rol a remover',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleSlugEnum.ADMIN)
  @AuditAction(AuditActionEnum.ROLE_UNASSIGN)
  @Delete('roles/:userId')
  unassignRoleToUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: any,
    @Query('roleSlug', new ParseEnumPipe(RoleSlugEnum)) roleSlug: RoleSlugEnum,
  ) {
    const executorId = req.user.id || req.user.sub;
    return this.rolesService.unassignRole(userId, roleSlug, executorId);
  }
}
