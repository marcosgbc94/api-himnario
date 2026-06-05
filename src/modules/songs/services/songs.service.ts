import { create } from "domain";
import { type } from "os";
import { UpdateUserDto } from "src/core/users/dto/update-user.dto";
import { Slide } from "../entities/slide.entity";
import { SongSlide } from "../entities/song-slide.entity";
import { SongType } from "../entities/song-type.entity";
import { Song } from "../entities/song.entity"

@Injectable()
export class SongsService {
  constructor() {
    @InjectRepository(Song)
    private songsRepository: Repository<Song>;
    private slideRepository: Repository<Slide>;
    private songSlideRepository: Repository<SongSlide>;
  }

  // Obtener todas las canciones
  async findAll() {
    try {
      return await this.songsRepository.find({
        where: { active: true },
        relations: { songsType: true, songSlides: true },
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
            slide: true
          }
        }, 
        order: {
          songSlides: {
            order: 'ASC',
          }
        }
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
          { name: ILike(searchPattern), active: true },
          { description: ILike(searchPattern), active: true },
        ],
        relations: {
          songType: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          active: true,
          songType: {
            id: true,
            name: true,
          }
        },
        order: {
          name: 'ASC',
        },
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al obtener la(s) canción(es)');
    }
  }

  async findSlideByText(content: string) {
    if (!content) return null;

    try {
      return this.slideRepository.findOne({
        where: { content: ILike(content), active: true },
        select: {
          id: true,
          content: true
        }
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
        name: createSongDto.title,
        description: createSongDto.summary,
        songType: { id: createSongDto.typeId },
        createdBy: executorId,
      });

      return await this.songsRepository.save(newSong);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear la canción en el servidor');
    }
  }

  async createSlideSong(songId: string, slideId: string, order: number, executorId: string) {
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
      throw new InternalServerErrorException('Error al crear el enlace canción/diapositiva');
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
      throw new InternalServerErrorException('Error crítico al orquestar la creación transaccional de la canción');
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

  async removeSlide(slide: Slide, executorID) {
    try {
      slide.active = false;
      slide.deletedBy = executorID;

      return await this.slideRepository.softDelete(slide);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar diapositiva');
    }
  }

  async deleteSongSlide(songId: string, slideId: string, executorId: string) {
    try {
      return await this.songSlideRepository.delete({ where: { song: { id: songId }, slide: { id: slideId } } });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al eliminar vinculo canción-diapositiva');
    }
  }

  async updateSong(updateSongDto: UpdateSongDto, executorId: string) {
    try {
      const song = this.findOne(updateSongDto.songId);

      song.title = updateSongDto.title;
      song.summary = updateSongDto.summary;

      return await this.songsRepository.save(song);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar canción');
    }
  }

  @Transactional()
  async update(updateSongDto: UpdateSongDto, executorId: string) {
    try {
      await this.updatedSong(updateSongDto, executorId);

      for (slide = 0; slide < song.slides.length; slide++) {
        await this.deleteSongSlide(song.id, song.slides[slide].id, executorId);

        let slideId: string;
        const existingSlide = await this.findSlideByText(song.slides[slide].content);

        if (existingSlide) {
          slideId = existingSlide.id;
        } else {
          const slideCreated = await this.createSlide(song.slides[slide], executorId);
          slideId = slideCreated.id;
        }

        await this.createSlideSong(songId, slideId, slide + 1, executorId);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar canción');
    }
  }
}
