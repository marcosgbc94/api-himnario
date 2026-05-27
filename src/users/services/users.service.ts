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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

      return await this.usersRepository.save(userCreated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // Método para obtener todos los usuarios
  async findAll(state: string) {
    try {
      const whereCondition = {};

      if (state === "ACTIVES") {
        whereCondition.active = true;
      } else if (state === "INACTIVES") {
        whereCondition.active = false;
      }

      return await this.usersRepository.find({ where: whereCondition });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  // Método para obtener un usuario por su ID
  async findOne(id: string, state: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const whereCondition = { id };

      if (state === "ACTIVE") {
        whereCondition.active = true;
      } else if (state === "INACTIVE") {
        whereCondition.active = false;
      }

      const user = await this.usersRepository.findOne({ where: whereCondition });

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
      return await this.usersRepository.findOneBy({ email, active: true });
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

      const user = await this.findOne(id, "ACTIVE");

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

      const user = await this.findOne(id, "ACTIVE");

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

      const user = await this.findOne(id, "ACTIVE");

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
  async remove(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id, "ALL");

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = false;
      user.deletedBy = userId;

      await this.usersRepository.save(user);

      // Aplica el soft remove para que TypeORM estampe la fecha en 'deleted_at'
      return await this.usersRepository.softRemove(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}
