import {
  Injectable,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional';

import { Slide } from '../entities/slide.entity';
import { SongSlide } from '../entities/song-slide.entity';
import { SongType } from '../entities/song-type.entity';
import { Song } from '../entities/song.entity';
import { CreateSlideDto } from '../dto/create-slide.dto';
import { CreateSongDto } from '../dto/create-song.dto';
import { UpdateSongDto } from '../dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private songsRepository: Repository<Song>,
    @InjectRepository(Slide)
    private slideRepository: Repository<Slide>,
    @InjectRepository(SongSlide)
    private songSlideRepository: Repository<SongSlide>,
  ) {}

  // Obtener todas las canciones
  async findAll() {
    try {
      return await this.songsRepository.find({
        where: { active: true },
        relations: { songType: true, songSlides: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener las canciones');
    }
  }

  // Buscar una determinada canción
  async findOne(songId: string) {
    try {
      return await this.songsRepository.findOne({
        where: { id: songId, active: true },
        relations: {
          songType: true,
          songSlides: {
            slide: true,
          },
        },
        order: {
          songSlides: {
            order: 'ASC',
          },
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener la canción');
    }
  }

  // Busqueda personalizada de canciones
  async search(term: string) {
    try {
      if (!term || term.trim() === '') return [];

      const searchPattern = `%${term}%`;

      return await this.songsRepository.find({
        where: [
          { title: ILike(searchPattern), active: true },
          { summary: ILike(searchPattern), active: true },
        ],
        relations: {
          songType: true,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          active: true,
          songType: {
            id: true,
            type: true,
            active: true,
          },
        },
        order: {
          title: 'ASC',
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener la(s) canción(es)',
      );
    }
  }

  async findSlideByText(
    content: string,
    active: boolean | undefined = undefined,
  ) {
    if (!content) return null;

    try {
      return this.slideRepository.findOne({
        where: { content: ILike(content), active: active },

        select: {
          id: true,
          content: true,
        },
        withDeleted: true,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener la diapositiva');
    }
  }

  async createSlide(createSlideDto: CreateSlideDto, executorId: string) {
    try {
      const newSlide = this.slideRepository.create({
        content: createSlideDto.content,
        createdBy: executorId,
      });

      return this.slideRepository.save(newSlide);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear la diapositiva');
    }
  }

  async createSong(createSongDto: CreateSongDto, executorId: string) {
    try {
      const newSong = this.songsRepository.create({
        title: createSongDto.title,
        summary: createSongDto.summary,
        songType: { id: createSongDto.typeId },
        createdBy: executorId,
      });

      return await this.songsRepository.save(newSong);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al crear la canción en el servidor',
      );
    }
  }

  async createSlideSong(
    songId: string,
    slideId: string,
    order: number,
    executorId: string,
  ) {
    try {
      const newSongSlide = this.songSlideRepository.create({
        song: { id: songId },
        slide: { id: slideId },
        order: order,
        createdBy: executorId,
      });

      return await this.songSlideRepository.save(newSongSlide);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al crear el enlace canción/diapositiva',
      );
    }
  }

  @Transactional()
  async create(createSongDto: CreateSongDto, executorId: string) {
    try {
      const songCreated = await this.createSong(createSongDto, executorId);
      const songId = songCreated.id;

      for (let i = 0; i < createSongDto.slides.length; i++) {
        const slideDto = createSongDto.slides[i];
        const currentOrder = i + 1;

        let slideId: string;
        const existingSlide = await this.findSlideByText(slideDto.content);

        if (existingSlide) {
          slideId = existingSlide.id;
        } else {
          const slideCreated = await this.createSlide(slideDto, executorId);
          slideId = slideCreated.id;
        }

        await this.createSlideSong(songId, slideId, currentOrder, executorId);
      }

      return songCreated;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error crítico al orquestar la creación transaccional de la canción',
      );
    }
  }

  async findSlide(slideId: string) {
    try {
      return this.slideRepository.findOne({
        where: { id: slideId, active: true },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener la diapositiva');
    }
  }

  async removeSlide(slideId: string, executorID: string) {
    try {
      const slide = await this.findSlide(slideId);

      if (!slide) {
        throw new NotFoundException(
          'No se encontró la diapositiva para eliminar',
        );
      }

      slide.active = false;
      slide.deletedBy = executorID;

      await this.slideRepository.save(slide);
      return await this.slideRepository.softDelete({ id: slideId });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar diapositiva');
    }
  }

  async findSongSlide(songId: string, slideId: string) {
    try {
      return await this.songSlideRepository.findOne({
        where: {
          song: { id: songId },
          slide: { id: slideId },
          active: true,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al obtener el enlace canción-diapositiva',
      );
    }
  }

  async deleteSongSlide(songId: string, slideId: string, executorId: string) {
    try {
      const songSlide = await this.findSongSlide(songId, slideId);

      if (!songSlide) {
        throw new NotFoundException(
          'No se encontró el enlace canción-diapositiva para eliminar',
        );
      }

      return await this.songSlideRepository.delete(songSlide.id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Error al eliminar vinculo canción-diapositiva',
      );
    }
  }

  async updateSong(
    songId: string,
    updateSongDto: UpdateSongDto,
    executorId: string,
  ) {
    try {
      const song = await this.findOne(songId);

      if (!song) {
        throw new NotFoundException(
          'No se encontró la canción para actualizar',
        );
      }

      if (updateSongDto.title) song.title = updateSongDto.title;
      if (updateSongDto.summary) song.summary = updateSongDto.summary;
      if (updateSongDto.typeId) {
        song.songType = { id: updateSongDto.typeId } as SongType;
      }
      song.updatedBy = executorId;

      return await this.songsRepository.save(song);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar canción');
    }
  }

  @Transactional()
  async update(
    songId: string,
    updateSongDto: UpdateSongDto,
    executorId: string,
  ) {
    try {
      const song = await this.updateSong(songId, updateSongDto, executorId);

      if (updateSongDto.slides && updateSongDto.slides.length > 0) {
        await this.songSlideRepository.delete({ song: { id: song.id } });

        const orphanSlideIds = new Set<string>();
        if (song.songSlides) {
          song.songSlides.forEach((ss) => {
            if (ss.slide) orphanSlideIds.add(ss.slide.id);
          });
        }

        for (let i = 0; i < updateSongDto.slides.length; i++) {
          const slideDto = updateSongDto.slides[i];

          let slideId: string;

          const existingSlide = await this.findSlideByText(slideDto.content);

          if (existingSlide) {
            slideId = existingSlide.id;

            if (
              existingSlide.active === false ||
              existingSlide.deletedAt !== null
            ) {
              existingSlide.active = true;
              existingSlide.updatedBy = executorId;
              existingSlide.deletedBy = null;
              existingSlide.deletedAt = null;

              await this.slideRepository.save(existingSlide);
            }

            orphanSlideIds.delete(slideId);
          } else {
            const slideCreated = await this.createSlide(slideDto, executorId);
            slideId = slideCreated.id;
          }

          await this.createSlideSong(song.id, slideId, i + 1, executorId);
        }

        if (orphanSlideIds.size > 0) {
          const idsToDelete = Array.from(orphanSlideIds);
          for (const id of idsToDelete) {
            await this.removeSlide(id, executorId);
          }
        }
      }

      return await this.findOne(songId);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar canción');
    }
  }

  @Transactional()
  async delete(songId: string, executorId: string) {
    try {
      const song = await this.findOne(songId);

      if (!song) {
        throw new NotFoundException('No se encontró la canción para eliminar');
      }

      // Obtiene los IDs de las diapositivas asociadas a la canción antes de desactivarlas
      const slideIdsDeLaCancion =
        song.songSlides?.map((ss) => ss.slide.id) || [];

      // Desactiva los enlaces canción-diapositiva asociados a la canción
      await this.songSlideRepository.update(
        { song: { id: songId } },
        { active: false },
      );

      if (slideIdsDeLaCancion.length > 0) {
        // Verifica si las diapositivas de la canción están siendo utilizadas por otras canciones activas
        const slidesInUse = await this.songSlideRepository
          .createQueryBuilder('songSlide')
          .select('songSlide.slideId', 'slideId')
          .where('songSlide.slideId IN (:...ids)', { ids: slideIdsDeLaCancion })
          .andWhere('songSlide.active = :active', { active: true })
          .getRawMany();

        // Obtiene los IDs de las diapositivas que aún están en uso por otras canciones activas
        const idsSlidesInUse = slidesInUse.map((s) => s.slideId);

        // Filtra los IDs de las diapositivas de la canción que no están siendo utilizadas por otras canciones activas
        const idsNotInUse = slideIdsDeLaCancion.filter((id) => {
          return !idsSlidesInUse.includes(id);
        });

        if (idsNotInUse.length > 0) {
          // Desactiva las diapositivas que no están siendo utilizadas por otras canciones activas
          await this.slideRepository.update(
            { id: In(idsNotInUse) },
            { active: false, deletedBy: executorId },
          );
        }
      }

      song.active = false;
      song.deletedBy = executorId;

      // Al desactivar la canción, también se desactivan los enlaces canción-diapositiva y las diapositivas que no están siendo utilizadas por otras canciones activas
      return await this.songsRepository.save(song);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar canción');
    }
  }
}
