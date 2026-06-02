import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from 'src/users/services/users.service';
import { Payload } from '../models/payload.model';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  // Valida un usuario comparando el email y la contraseña con los datos almacenados en la base de datos
  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al validar el usuario');
    }
  }

  // Genera un token JWT para el usuario autenticado
  generateToken(userId: string): string {
    const payload: Payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  // Obtiene un determinado Role por medio de su slug
  async getRoleBySlug(slug: string) {
    try {
      const role = await this.roleRepository.findOne({ where: { slug: slug, active: true } });

      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }

      return role;
    } catch (error) {
      if (error instanceof HttpException) if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener el rol');
    }
  }

  // Asigna un rol a un determinado usuario
  async assignRole(userId: string, roleSlug: string) {
    try {
      const userFinded = await this.usersService.findOne(userId);
      const roleFinded = await this.getRoleBySlug(roleSlug);

      const newUserRole = this.roleRepository.merge(roleFinded, {
        userRoles: [{ user: userFinded }],
      });

      return await this.roleRepository.save(newUserRole);
    } catch (error) {
      if (error instanceof HttpException) if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al asignar el rol');
    }
  }

  // Busca un determino rol asignado a un determinado usuario
  async getUserRole(userId: string, roleSlug: string = '', active: boolean = true) {
      try {
        const userFound = await this.usersService.findOne(userId);
        const roleFound = await this.getRoleBySlug(roleSlug);

        return await this.userRoleRepository.findOne({
          where: { userId: userFound.id, roleId: roleFound.id, active: active }
        });
      } catch (error) {
        if (error instanceof HttpException) throw error;
        throw new InternalServerErrorException('Error al buscar el rol');
      }
  }

  // Busca todos los roles asignados a un terminado usuario
  async getUserRoles(userId: string, active: boolean = true) {
    try {
      const userFound = await this.usersService.findOne(userId);

      const userRole = await this.userRoleRepository.find({
        where: { userId: userFound.id, active: active },
        relations: { role: true }
      });

      if (!userRole) {
        NotFoundException('Rol de usuario no encontrado');
      }

      return userRole;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al buscar el rol');
    }
}

  // Quita un rol específico a un determinado usuario
  async unassignRole(userId: string, roleSlug: string, executorId: string) {
    try {
      const userRole = await this.getUserRole(userId, roleSlug);
  
      if (!userRole) {
        throw new BadRequestException(
          'El usuario no tiene asignado este rol o ya fue desasignado'
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
      const userRoles = await this.getUserRole(userId);

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
