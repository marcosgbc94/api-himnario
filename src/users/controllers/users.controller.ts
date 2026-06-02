import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersStateFilter } from '../dto/find-users.dto';
import { UserStateFilter } from '../dto/find-user.dto';
import type { RequestWithUser } from 'src/auth/models/request.model';
import { AbacGuard } from '../../auth/guards/abac.guard';
import { Action, Resource } from '../../auth/abac/abac.types';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CheckPolicies } from '../../auth/decorators/check-policies.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleSlug } from '../../auth/models/role-slug.model';
import { RoleSlugDto } from '../dto/role-slug.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está en uso' })
  @ApiResponse({ status: 500, description: 'Error al crear el usuario' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleSlug.ADMIN, RoleSlug.EDITOR)
  @CheckPolicies({ action: Action.CREATE, resource: Resource.USER })
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
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
  @ApiQuery({
    name: 'state',
    required: false,
    enum: UsersStateFilter,
    description: 'Filtrar por estado del usuario. Si se omite, el valor por defecto es ACTIVES.' 
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: RoleSlug,
    description: 'Filtrar por rol del usuario.',
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, AbacGuard)
  @Roles(RoleSlug.ADMIN, RoleSlug.EDITOR, RoleSlug.USER)
  @CheckPolicies({ action: Action.READ, resource: Resource.USER })
  @Get()
  async findAll(
    @Query('state') state?: UsersStateFilter,
    @Query('role') role?: RoleSlugDto,
  ) {
    return await this.usersService.findAll(
      state || UsersStateFilter.ACTIVES,
      role || undefined,
    );
  }

  @ApiOperation({ summary: 'Obtener un determinado usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
  @ApiQuery({
    name: 'state',
    required: false,
    enum: UserStateFilter,
    description: 'Filtrar por estado del usuario. Si se omite, el valor por defecto es ACTIVE.' 
  })
  @UseGuards(AuthGuard('jwt'), RolesGuard, AbacGuard)
  @Roles(RoleSlug.ADMIN, RoleSlug.EDITOR)
  @CheckPolicies({ action: Action.READ, resource: Resource.USER })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('state') state?: UserStateFilter,
  ) {
    return await this.usersService.findOne(id, state || UserStateFilter.ACTIVE);
  }

  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'ID de usuario es requerido o usuario no encontrado',
  })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
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
  async activate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.activate(id, userId);
  }

  @ApiOperation({ summary: 'Desactivar un usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al desactivar el usuario' })
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.deactivate(id, userId);
  }
}
