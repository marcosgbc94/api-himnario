import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';
import { Role } from '../../core/roles/entities/role.entity';
import { RoleSlugEnum } from '../../core/roles/enums/role-slug.enum';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const rolesRepository = app.get<Repository<Role>>(getRepositoryToken(Role));

  console.log('Iniciando el seeding de Roles...');

  const defaultRoles = [
    {
      slug: RoleSlugEnum.ADMIN,
      name: 'Administrador',
    },
    {
      slug: RoleSlugEnum.USER,
      name: 'Usuario',
    },
  ];

  try {
    for (const roleData of defaultRoles) {
      const existingRole = await rolesRepository.findOneBy({
        slug: roleData.slug,
      });

      if (!existingRole) {
        const newRole = rolesRepository.create(roleData);
        await rolesRepository.save(newRole);
        console.log(`Rol creado con éxito: [${roleData.slug}]`);
      } else {
        console.log(`El rol [${roleData.slug}] ya existe en la base de datos.`);
      }
    }
    console.log('Seeding de roles completado.');
  } catch (error) {
    console.error('Error al insertar los roles:', error);
  } finally {
    await app.close();
  }
}

run();