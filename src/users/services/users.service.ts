import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { AuthService } from '../../auth/services/auth.service';
import { RoleSlug } from 'src/auth/models/role-slug.model';
import { RoleSlugDto } from '../dto/role-slug.dto';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  // Método para crear un nuevo usuario
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

      const userCreatedResult = await this.usersRepository.save(userCreated);

      if (!userCreatedResult) {
        throw new InternalServerErrorException('Error al crear el usuario');
      }

      await this.authService.assignRole(userCreatedResult.id, RoleSlug.USER); // Asigna el rol de "user" al usuario creado
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // Método para obtener todos los usuarios
  async findAll(state?: string, roleSlug: RoleSlugDto | undefined = undefined) {
    try {
      const query = this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.userRoles', 'userRoles')
        .leftJoinAndSelect('userRoles.role', 'role');

      if (state === 'ACTIVES') {
        query.andWhere('user.active = :active', { active: true });
      } else if (state === 'INACTIVES') {
        query.andWhere('user.active = :active', { active: false });
      }

      if (roleSlug) {
        query.andWhere('role.slug = :slug', {
          slug: roleSlug,
        });
      }

      return await query.getMany();
    } catch {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  // Método para obtener un usuario por su ID
  async findOne(id: string, state: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      if (state === 'ACTIVE') {
        return await this.usersRepository.findOne({
          where: {
            id,
            active: true,
          },
        });
      } else if (state === 'INACTIVE') {
        return await this.usersRepository.findOne({
          where: {
            id,
            active: false,
          },
        });
      }

      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  // Método para obtener un usuario por su correo electrónico
  async findByEmail(email: string) {
    try {
      return await this.usersRepository.findOne({
        where: {
          email,
          active: true,
        },
        relations: ['userRoles', 'userRoles.role'],
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener el usuario por correo electrónico',
      );
    }
  }

  // Método para actualizar un usuario
  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id, 'ACTIVE');

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const userUpdated = this.usersRepository.merge(user, updateUserDto);

      userUpdated.updatedBy = userId;

      return await this.usersRepository.save(userUpdated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  // Método para activar un usuario
  async activate(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id, 'ACTIVE');

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = true;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al activar el usuario');
    }
  }

  // Método para desactivar un usuario
  async deactivate(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id, 'ACTIVE');

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = false;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al desactivar el usuario');
    }
  }

  // Método para eliminar un usuario (soft delete)
  @Transactional()
  async remove(id: string, executorId: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) throw new BadRequestException('Usuario no encontrado');

      user.active = false;
      user.deletedBy = executorId;

      await this.usersRepository.save(user);
      await this.usersRepository.softRemove(user);

      await this.authService.deleteUserRoles(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}
