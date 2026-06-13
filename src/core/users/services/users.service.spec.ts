import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const userMock = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    names: 'Ana',
    email: 'ana@ana.cl',
    lastNames: 'Moringa Morning'
  };

  const mockRepository = {
    findOne: jest.fn().mockResolvedValue(userMock),
    create: jest.fn().mockImplementation(dto => dto),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), 
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debería retornar un usuario determinado', async () => {
    const usuario = await service.findOne(userMock.id);
    expect(usuario.email).toEqual(userMock);
    expect(mockRepository.findOne).toHaveBeenCalledWith({id: userMock.id });
  });
});
