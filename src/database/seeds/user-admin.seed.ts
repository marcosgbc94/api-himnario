import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';
import { User } from '../../core/users/entities/user.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

  console.log('Iniciando el seeding de Usuario administrador...');

  const defaultAdminUser = [
    {
      names: 'Admin',
      lastNames: 'Instrador',
      email: 'admin@admin.com',
      password: 'admin123',
    },
  ];

  try {
    for (const userData of defaultAdminUser) {
      const existingUser = await usersRepository.findOneBy({
        email: userData.email,
      });

      if (!existingUser) {
        const newUser = usersRepository.create(userData);
        await usersRepository.save(newUser);
        console.log(`Usuario creado con éxito: [${userData.email}]`);
      } else {
        console.log(
          `El usuario [${userData.email}] ya existe en la base de datos.`,
        );
      }
    }
    console.log('Seeding de usuarios completado.');
  } catch (error) {
    console.error('Error al insertar los usuarios:', error);
  } finally {
    await app.close();
  }
}

run();