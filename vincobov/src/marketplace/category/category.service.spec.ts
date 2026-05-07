import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Category } from '../entities/category.entity';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: mockRepository },
      ],
    }).compile();
    service = module.get<CategoryService>(CategoryService);
  });

  it('debe crear categoria', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);
    mockRepository.create.mockReturnValue({ id: 1, name: 'Ganado' });
    mockRepository.save.mockResolvedValue({ id: 1, name: 'Ganado' });
    const result = await service.create({ name: 'Ganado', description: 'x' });
    expect(result.name).toBe('Ganado');
  });

  it('debe fallar si categoria existe', async () => {
    mockRepository.findOneBy.mockResolvedValue({ id: 1, name: 'Ganado' });
    await expect(
      service.create({ name: 'Ganado', description: 'x' }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe fallar findOne cuando no existe', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(8)).rejects.toThrow(NotFoundException);
  });
});
