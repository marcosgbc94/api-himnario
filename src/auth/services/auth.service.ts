import {
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../../users/services/users.service';
import { Payload } from '../models/payload.model';
import { UserRole } from '../entities/user-role.entity';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) // Evita la dependencia circular entre AuthService y UsersService
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  // Valida un usuario comparando el email y la contraseña con los datos almacenados en la base de datos
  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el usuario');
    }
  }

  // Genera un token JWT para el usuario autenticado
  generateToken(userId: string, email: string, roles: string[]): string {
    const payload: Payload = {
      sub: userId,
      email: email,
      roles: roles || [],
    };
    return this.jwtService.sign(payload);
  }

  // Obtiene un rol por su slug
  getRoleBySlug(roleSlug: string) {
    if (!roleSlug) {
      throw new Error('Slug de rol es requerido');
    }

    return this.rolesRepository.findOne({
      where: { slug: roleSlug },
    });
  }

  async getUserRoles(
    userId: string,
    onlyRoles = false,
  ): Promise<UserRole[] | string[]> {
    try {
      const userRoles = await this.userRolesRepository.find({
        where: { userId, active: true },
        relations: ['role'],
      });

      if (onlyRoles) {
        return userRoles
          .map((userRole) => userRole.role?.slug)
          .filter((slug): slug is string => !!slug);
      }

      return userRoles;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener los roles del usuario',
      );
    }
  }

  // Asigna un rol a un usuario
  async assignRole(userId: string, roleSlug: string) {
    try {
      const role = await this.getRoleBySlug(roleSlug);

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      const newUserRole = this.userRolesRepository.create({
        userId,
        roleId: role.id,
      });
      return this.userRolesRepository.save(newUserRole);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al asignar el rol al usuario',
      );
    }
  }

  async unassignRole(userId: string, roleSlug: string) {
    try {
      const role = await this.getRoleBySlug(roleSlug);

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      return await this.userRolesRepository.softRemove({
        userId,
        roleId: role.id,
        active: false,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al quitar el rol al usuario',
      );
    }
  }

  @Transactional()
  async deleteUserRoles(userId: string) {
    try {
      const userRoles = await this.userRolesRepository.find({
        where: { userId, active: true },
      });
      if (!userRoles.length) return [];

      const updatedUserRoles = userRoles.map((ur) => {
        ur.active = false;
        return ur;
      });

      return await this.userRolesRepository.softRemove(updatedUserRoles);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al eliminar los roles del usuario',
      );
    }
  }
}
