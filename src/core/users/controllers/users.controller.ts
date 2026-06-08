import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import type { RequestWithUser } from 'src/core/auth/models/request.model';
import { RolesGuard } from '../../roles/guards/role.guard';
import { Roles } from '../../roles/decorators/roles.decorator';
import { RoleSlugEnum } from '../../roles/enums/role-slug.enum';
import { AuditAction } from '../../audit/decorators/audit.decorator';
import { AuditActionEnum } from '../../audit/enums/AuditAction.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está en uso' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @AuditAction(AuditActionEnum.USER_CREATE)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.create(createUserDto, userId);
  }

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de todos los usuarios' })
  @ApiResponse({ status: 500, description: 'Error al obtener los usuarios' })
  @Roles(RoleSlugEnum.ADMIN)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un determinado usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al obtener el usuario' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'ID de usuario es requerido o usuario no encontrado',
  })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
  @Roles(RoleSlugEnum.ADMIN, RoleSlugEnum.USER)
  @AuditAction(AuditActionEnum.USER_UPDATE)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.update(id, updateUserDto, userId);
  }

  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al eliminar el usuario' })
  @Roles(RoleSlugEnum.ADMIN)
  @AuditAction(AuditActionEnum.USER_DELETE)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.remove(id, userId);
  }

  @ApiOperation({ summary: 'Activar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado exitosamente' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al activar el usuario' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleSlugEnum.ADMIN)
  @AuditAction(AuditActionEnum.USER_ACTIVE)
  @Patch('activate/:userId')
  async activate(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: RequestWithUser,
  ) {
    const executorId = req.user.sub;
    return await this.usersService.activate(userId, executorId);
  }

  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al desactivar el usuario' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleSlugEnum.ADMIN)
  @AuditAction(AuditActionEnum.USER_DEACTIVE)
  @Patch('deactivate/:userId')
  async deactivate(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Req() req: RequestWithUser,
  ) {
    const executorId = req.user.sub;
    return await this.usersService.deactivate(userId, executorId);
  }
}
