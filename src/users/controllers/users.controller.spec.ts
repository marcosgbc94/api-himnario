import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const userMock = { 
    id: "123e4567-e89b-12d3-a456-426614174000",
    names: 'Ana',
    email: 'ana@ana.cl',
    lastNames: 'Moringa Morning'
  };

  const mockUsersService = {
    findOne: jest.fn().mockResolvedValue(userMock),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: mockUsersService,
      }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('debería retornar el usuario que el servicio encontró', async () => {
    const result = await controller.findOne(userMock.id);
    expect(result).toEqual(userMock);
    expect(service.findOne).toHaveBeenCalledWith(userMock.id);
  });
});
