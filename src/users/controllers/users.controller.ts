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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import type { RequestWithUser } from 'src/auth/models/request.model';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleSlugEnum } from 'src/auth/enums/role-slug.enum';

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
  @Roles(RoleSlugEnum.ADMIN)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un determinado usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 400, description: 'ID de usuario es requerido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el usuario' })
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
  @Roles(RoleSlugEnum.ADMIN)
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
  @Roles(RoleSlugEnum.ADMIN)
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    const payload = req.user;
    const userId = payload.sub;
    return await this.usersService.deactivate(id, userId);
  }
}
