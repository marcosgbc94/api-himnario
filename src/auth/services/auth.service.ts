import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/services/users.service';
import { Payload } from '../models/payload.model';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
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
  generateToken(userId: string): string {
    const payload: Payload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  async getRoleBySlug(slug: string) {
    try {
      return await this.roleRepository.findOne({ where: { slug: slug } });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el rol');
    }
  }

  @Transactional()
  async assignRole(userId: string, role: string) {
    try {
      const userFinded = await this.usersService.findOne(userId);
      if (!userFinded) throw new UnauthorizedException('Usuario no autorizado');

      const roleFinded = await this.getRoleBySlug(role);
      if (!roleFinded) throw new UnauthorizedException('Rol no encontrado');

      const newUserRole = this.roleRepository.merge(roleFinded, {
        userRoles: [{ user: userFinded }],
      });

      return await this.roleRepository.save(newUserRole);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al asignar el rol');
    }
  }
}
