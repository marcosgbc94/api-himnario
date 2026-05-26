import {
  BadRequestException,
  ConflictException,
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
    } catch {
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  // Método para obtener todos los usuarios
  async findAll() {
    try {
      return await this.usersRepository.find();
    } catch {
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  // Método para obtener un usuario por su ID
  async findOne(id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.usersRepository.findOneBy({ id });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      return user;
    } catch {
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }

  // Método para obtener un usuario por su correo electrónico
  async findByEmail(email: string) {
    try {
      return await this.usersRepository.findOneBy({ email });
    } catch {
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

      const user = await this.findOne(id);

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.updatedBy = userId;

      const userUpdated = this.usersRepository.merge(user, updateUserDto);
      return await this.usersRepository.save(userUpdated);
    } catch {
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  // Método para activar un usuario
  async activate(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id);

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = true;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error al activar el usuario');
    }
  }

  // Método para desactivar un usuario
  async deactivate(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id);

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = false;
      user.updatedBy = userId;

      return await this.usersRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error al desactivar el usuario');
    }
  }

  // Método para eliminar un usuario (soft delete)
  async remove(id: string, userId: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID de usuario es requerido');
      }

      const user = await this.findOne(id);

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      user.active = false;
      user.deletedBy = userId;

      await this.usersRepository.save(user);

      // Aplica el soft remove para que TypeORM estampe la fecha en 'deleted_at'
      await this.usersRepository.softRemove(user);
    } catch {
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}
