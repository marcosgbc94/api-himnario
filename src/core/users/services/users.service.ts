import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { RolesService } from '../../roles/services/roles.service';
import { RoleSlugEnum } from '../../roles/enums/role-slug.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => RolesService))
    private rolesService: RolesService,
  ) {}

  // Método para crear un nuevo usuario con rol de usuario por defecto
  @Transactional()
  async create(createUserDto: CreateUserDto, userId: string) {
    try {
      const emailExists = await this.findByEmail(createUserDto.email);

      if (emailExists) {
        throw new ConflictException('El correo ya está en uso');
      }

      const userCreated = this.usersRepository.create({
        ...createUserDto,
        createdBy: userId,
      });

      await this.usersRepository.save(userCreated);

      return this.rolesService.assignRole(
        userCreated.id,
        RoleSlugEnum.USER,
        userId,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // Método para obtener todos los usuarios
  async findAll() {
    try {
      return await this.usersRepository.find({
        where: { active: true },
        relations: { userRoles: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  // Método para obtener un usuario por su ID
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.usersRepository.findOne({
        where: { id, active: true },
        relations: { userRoles: true },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  // Método para obtener un usuario por su ID incluyendo sus roles
  async findOneWithRoles(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.usersRepository.findOne({
        where: {
          id,
          active: true,
          userRoles: {
            active: true,
            role: {
              active: true,
            },
          },
        },
        relations: {
          userRoles: {
            role: true,
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  // Método para obtener un usuario por su correo electrónico
  async findByEmail(email: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: email,
          active: true,
          userRoles: {
            active: true,
            role: {
              active: true,
            },
          },
        },
        relations: {
          userRoles: {
            role: true,
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no autorizado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el usuario por correo electrónico',
      );
    }
  }

  // Método para actualizar un usuario
  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    try {
      const user = await this.findOne(id);
      const userUpdated = this.usersRepository.merge(user, updateUserDto);

      userUpdated.updatedBy = userId;

      return await this.usersRepository.save(userUpdated);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  // Método para activar un usuario
  async activate(id: string, userId: string) {
    try {
      const user = await this.findOne(id);

      user.active = true;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al activar el usuario');
    }
  }

  // Método para desactivar un usuario
  async deactivate(id: string, userId: string) {
    try {
      const user = await this.findOne(id);

      user.active = false;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al desactivar el usuario');
    }
  }

  // Método para eliminar un usuario (soft delete)
  @Transactional()
  async remove(id: string, userId: string) {
    try {
      const user = await this.findOne(id);

      user.active = false;
      user.deletedBy = userId;

      await this.usersRepository.save(user);

      // Aplica el soft remove para que TypeORM estampe la fecha en 'deleted_at'
      return await this.usersRepository.softRemove(user);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}
