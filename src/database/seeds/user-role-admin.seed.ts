import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';
import { User } from '../../core/users/entities/user.entity';
import { Role } from '../../core/roles/entities/role.entity';
import { RoleSlugEnum } from '../../core/roles/enums/role-slug.enum';
import { UserRole } from '../../core/roles/entities/user-role.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const rolesRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const userRoleRepository = app.get<Repository<UserRole>>(getRepositoryToken(UserRole));

  const defaultRoleAdmin = {
    email: 'admin@admin.com',
    roleSlug: RoleSlugEnum.ADMIN,
  };

  console.log('Iniciando el seeding de Usuario administrador...');

  try {
    // USERS
    const user = await usersRepository.findOneBy({
      email: defaultRoleAdmin.email,
      active: true,
    });

    if (!user) {
      console.log(
        'No se encontró el usuario administrador. Por favor, ejecute primero el seeding de usuarios para crear el usuario administrador.',
      );
      await app.close();
      return;
    }

    // ROLES
    const role = await rolesRepository.findOneBy({
      slug: defaultRoleAdmin.roleSlug,
      active: true,
    });

    if (!role) {
      console.log(
        'No se encontró el rol de administrador. Por favor, ejecute primero el seeding de roles para crear el rol de administrador.',
      );
      await app.close();
      return;
    }

    // USER ROLE
    const userRole = await userRoleRepository.findOneBy({
      userId: user.id,
      roleId: role.id,
    });

    if (userRole) {
      console.log(
        `El usuario [${user.email}] ya tiene el rol de administrador.`,
      );
      await app.close();
      return;
    }

    const userData = {
      userId: user.id,
      roleId: role.id,
    };

    const newUser = userRoleRepository.create(userData);
    await userRoleRepository.save(newUser);

    console.log(`Rol de Usuario asignado con éxito: [${user.email}]`);

    console.log('Seeding de roles de usuarios completado.');
  } catch (error) {
    console.error('Error al insertar los roles de usuarios:', error);
  } finally {
    await app.close();
  }
}

run();