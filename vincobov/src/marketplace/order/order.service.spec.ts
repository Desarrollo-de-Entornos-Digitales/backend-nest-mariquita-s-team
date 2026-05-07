import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../entities/order.entity';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const mockUserRepository = { findOneBy: jest.fn() };
  const mockProductRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
  });

  it('debe crear orden', async () => {
    mockUserRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockProductRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockOrderRepository.create.mockReturnValue({ id: 9 });
    mockOrderRepository.save.mockResolvedValue({ id: 9 });

    const result = await service.create({
      buyerId: 1,
      productId: 2,
      quantity: 2,
      unitPrice: 50,
      status: 'pending' as never,
    });
    expect(result.id).toBe(9);
  });

  it('debe fallar si buyer no existe', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({
        buyerId: 1,
        productId: 2,
        quantity: 2,
        unitPrice: 50,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
