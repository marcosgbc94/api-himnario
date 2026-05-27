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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FindUsersDto } from '../dto/find-users.dto';
import type { RequestWithUser } from 'src/auth/models/request.model';
import { AbacGuard } from '../guards/abac.guard';
import { Action, Resource } from '../abac/abac.types';

@UseGuards(AuthGuard('jwt'), RolesGuard, AbacGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
@CheckPolicies({ action: Action.UPDATE, resource: Resource.USER })
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El correo ya está en uso' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
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
  @Get()
  async findAll(@Query() query: FindUsersDto) {
    return await this.usersService.findAll(query.state);
  }

  @ApiOperation({ summary: 'Obtener un determinado usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
  @ApiQuery({ 
    name: 'state',
    required: false,
    enum: FindUserDto,
    description: 'Filtrar por estado del usuario. Si se omite, el valor por defecto es ACTIVE.' 
  })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    Query() query: FindUserDto,
  ) {
    return await this.usersService.findOne(id, query.state);
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
