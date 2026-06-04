import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { RoleSlugEnum } from '../enums/role-slug.enum';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  // Obtiene un determinado Role por medio de su slug
  async getRoleBySlug(slug: RoleSlugEnum) {
    try {
      const role = await this.roleRepository.findOne({
        where: { slug: slug, active: true },
      });

      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      return role;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener el rol');
    }
  }

  // Asigna un rol a un determinado usuario
  async assignRole(userId: string, roleSlug: RoleSlugEnum, executorId: string) {
    try {
      const userRole = await this.getUserRole(userId, roleSlug);

      if (!userRole) {
        throw new ConflictException(
          `El usuario ya tiene asignado el rol [${roleSlug}]`,
        );
      }

      const user = await this.userService.findOne(userId);
      const role = await this.getRoleBySlug(roleSlug);

      const newUserRole = this.userRoleRepository.create({
        user: user,
        role: role,
        createdBy: executorId,
      });

      return await this.userRoleRepository.save(newUserRole);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al asignar el rol');
    }
  }

  // Busca un determino rol asignado a un determinado usuario
  async getUserRole(
    userId: string,
    roleSlug: RoleSlugEnum = RoleSlugEnum.USER,
    active: boolean = true,
  ) {
    try {
      const userFound = await this.userService.findOne(userId);
      const roleFound = await this.getRoleBySlug(roleSlug);

      return await this.userRoleRepository.findOne({
        where: { userId: userFound.id, roleId: roleFound.id, active: active },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al buscar el rol');
    }
  }

  // Busca todos los roles asignados a un terminado usuario
  async getUserRoles(userId: string, active: boolean = true) {
    try {
      const userFound = await this.userService.findOne(userId);

      const userRole = await this.userRoleRepository.find({
        where: { userId: userFound.id, active: active },
        relations: { role: true },
      });

      if (!userRole) {
        throw new NotFoundException('Rol de usuario no encontrado');
      }

      return userRole;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al buscar el rol');
    }
  }

  // Quita un rol específico a un determinado usuario
  async unassignRole(
    userId: string,
    roleSlug: RoleSlugEnum,
    executorId: string,
  ) {
    try {
      const userRole = await this.getUserRole(userId, roleSlug);

      if (!userRole) {
        throw new BadRequestException(
          'El usuario no tiene asignado este rol o ya fue desasignado',
        );
      }

      userRole.active = false;
      userRole.deletedBy = executorId;

      await this.userRoleRepository.save(userRole);

      return await this.userRoleRepository.softRemove(userRole);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al desasignar el rol');
    }
  }

  // Quita todos los roles de un determinado usuario
  async unassignRoles(userId: string, executorId: string) {
    try {
      const userRoles = await this.getUserRoles(userId);

      if (!userRoles) {
        throw new BadRequestException(
          'El usuario no tiene asignado ningun rol o ya fue desasignado',
        );
      }

      const updatedUserRoles = userRoles.map((userRole) => {
        userRole.active = false;
        userRole.deletedBy = executorId;
        return userRole;
      });

      return await this.userRoleRepository.softRemove(updatedUserRoles);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al desasignar los roles');
    }
  }
}
