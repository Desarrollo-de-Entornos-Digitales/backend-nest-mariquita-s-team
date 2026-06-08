import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../../auth/entities/user.entity';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;

  const mockProductRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    preload: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();
    service = module.get<ProductService>(ProductService);
  });

  it('debe crear producto', async () => {
    mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockProductRepository.create.mockReturnValue({ id: 1 });
    mockProductRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create({
      title: 'A',
      description: 'B',
      category: 'agriculture' as never,
      price: 10,
      stock: 1,
      location: 'X',
      createdBy: 1,
    });

    expect(result.id).toBe(1);
  });

  it('debe fallar create si no hay vendedor', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({
        title: 'A',
        description: 'B',
        category: 'agriculture' as never,
        price: 10,
        stock: 1,
        location: 'X',
        createdBy: 99,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe fallar purchase por stock', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 1,
      stock: 0,
      createdBy: { id: 10 },
    } as never);

    await expect(service.purchase(1, 20, 2)).rejects.toThrow(
      BadRequestException,
    );
  });
});
