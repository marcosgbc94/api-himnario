import { NestFactory } from '@nestjs/core';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AppModule } from '../../app.module';
import { SongType } from '../../modules/songs/entities/song-type.entity';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const songTypeRepository = app.get<Repository<SongType>>(
    getRepositoryToken(SongType),
  );

  console.log('Iniciando el seeding de Song Types...');

  const defaultSongTypes = [
    {
      type: 'Coro',
    },
    {
      type: 'Himno',
    },
  ];

  try {
    for (const songType of defaultSongTypes) {
      const existingRole = await songTypeRepository.findOneBy({
        type: songType.type,
      });

      if (!existingRole) {
        const newRole = songTypeRepository.create(songType);
        await songTypeRepository.save(newRole);
        console.log(`Tipo de canción creado con éxito: [${songType.type}]`);
      } else {
        console.log(
          `El tipo de canción [${songType.type}] ya existe en la base de datos.`,
        );
      }
    }
    console.log('Seeding de tipos de canciones completado.');
  } catch (error) {
    console.error('Error al insertar los tipos de canciones:', error);
  } finally {
    await app.close();
  }
}

run();