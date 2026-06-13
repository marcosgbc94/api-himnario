import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from '../entities/song.entity';
import { SongType } from '../entities/song-type.entity';
import { SongSlide } from '../entities/song-slide.entity';
import { Slide } from '../entities/slide.entity';
import { SongsService } from './songs.service';
import { NotFoundException } from '@nestjs/common';

describe('SongsService', () => {
  let service: SongsService;

  let songRepository: jest.Mocked<Repository<Song>>;
  let songSlideRepository: jest.Mocked<Repository<SongSlide>>;
  let slideRepository: jest.Mocked<Repository<Slide>>;
  let songTypeRepository: jest.Mocked<Repository<SongType>>;

  const songMock = {
    id: '7f172713-f701-4f0f-bdf3-3e6dcae3e75f',
    title: 'Sublime Gracia',
    summary: 'Himno clásico de adoración cristiana',
    active: true,
    createdAt: '2026-06-13T22:50:00.000Z',
    createdBy: 'admin-uuid-1111',
    updatedAt: '2026-06-13T22:50:00.000Z',
    updatedBy: 'admin-uuid-1111',
    deletedAt: null,
    deletedBy: null,
    songType: {
      id: '3b2a7134-e802-4f0f-bdf3-9e6dcae3e88f',
      type: 'Himno',
      active: true,
    },
    songSlides: [
      {
        id: 'aa11bb22-c333-4444-5555-dd66ee77ff88',
        order: 1,
        songId: '7f172713-f701-4f0f-bdf3-3e6dcae3e75f',
        slideId: '074dd8f8-bffb-4877-916f-90681a2a8a5b',
        slide: {
          id: '074dd8f8-bffb-4877-916f-90681a2a8a5b',
          content: 'Sublime gracia del Señor\nQue a un pecador salvó',
          active: true,
          createdAt: '2026-06-13T22:50:00.000Z',
          createdBy: 'admin-uuid-1111',
          updatedAt: '2026-06-13T22:50:00.000Z',
          updatedBy: 'admin-uuid-1111',
          deletedAt: null,
          deletedBy: null,
        },
      },
    ],
  };

  beforeEach(async () => {
    const createMockRepository = () => ({
      create: jest.fn().mockImplementation((dto) => ({ ...dto, songSlides: [] })),
      save: jest.fn().mockResolvedValue(songMock),
      findOne: jest.fn().mockResolvedValue(songMock),
      find: jest.fn().mockResolvedValue([songMock]),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: getRepositoryToken(Song),
          useFactory: () => createMockRepository(),
        },
        {
          provide: getRepositoryToken(SongSlide),
          useFactory: () => createMockRepository(),
        },
        {
          provide: getRepositoryToken(Slide),
          useFactory: () => createMockRepository(),
        },
        {
          provide: getRepositoryToken(SongType),
          useFactory: () => createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);

    songRepository = module.get(getRepositoryToken(Song));
    songSlideRepository = module.get(getRepositoryToken(SongSlide));
    slideRepository = module.get(getRepositoryToken(Slide));
    songTypeRepository = module.get(getRepositoryToken(SongType));
  });

  describe('findOne', () => {
    it('debería retornar la canción solicitada por su ID', async () => {
      const result = await service.findOne(songMock.id);
      expect(result).toEqual(songMock);
      expect(songRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: songMock.id }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las canciones', async () => {
      const result = await service.findAll();
      expect(result).toEqual([songMock]);
      expect(songRepository.find).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('debería retornar la canción almacenada al orquestar todos los repositorios', async () => {
      const createSongDto = {
        title: 'Sublime Gracia',
        summary: 'Himno',
        typeId: '3b2a7134-e802-4f0f-bdf3-9e6dcae3e88f',
        slides: [
          { content: 'Sublime gracia del Señor\nQue a un pecador salvó' },
        ],
      };
      const executorId = 'admin-uuid-1111';

      songTypeRepository.findOne.mockResolvedValue({
        id: createSongDto.typeId,
        type: 'Himno',
        active: true
      } as any);

      slideRepository.save.mockResolvedValue({
        id: '074dd8f8-bffb-4877-916f-90681a2a8a5b',
        content: createSongDto.slides[0].content,
        active: true
      } as any);

      songSlideRepository.save.mockResolvedValue({} as any);

      songRepository.save.mockResolvedValue(songMock as any);

      const result = await service.create(createSongDto as any, executorId);

      expect(result).toEqual(songMock);
      expect(songRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debería actualizar los datos básicos y refrescar los slides vinculados', async () => {
      const updateSongDto = {
        title: 'Sublime Gracia (Versión Extendida)',
        summary: 'Himno con arreglos nuevos',
        slides: [
          { content: 'Sublime gracia del Señor\nQue a un pecador salvó' },
          { content: 'Nueva estrofa añadida en el DTO' },
        ],
      };
      const executorId = 'admin-uuid-1111';

      songRepository.findOne.mockResolvedValue(songMock as any);
      songSlideRepository.delete.mockResolvedValue({ affected: 2 } as any);
      slideRepository.save.mockResolvedValue({ id: 'nuevo-uuid-slide', active: true } as any);
      songSlideRepository.save.mockResolvedValue({} as any);
      songRepository.save.mockResolvedValue(songMock as any);
      const result = await service.update(songMock.id, updateSongDto as any, executorId);
      expect(result).toEqual(songMock);
      expect(songRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('debería aplicar un borrado lógico a la canción si existe', async () => {
      const idParaEliminar = songMock.id;
      songRepository.findOne.mockResolvedValue(songMock as any);
      songRepository.softDelete.mockResolvedValue({ affected: 1 } as any);
      const result = await service.delete(idParaEliminar);
      expect(songRepository.softDelete).toHaveBeenCalledWith({ id: idParaEliminar });
      expect(result).toBeDefined();
    });

    it('debería lanzar un NotFoundException si intentas eliminar una canción que no existe', async () => {
      songRepository.findOne.mockResolvedValue(null);
      await expect(service.delete('id-fantasma')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
