import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Order } from '../entities/order.entity';
import { Payment } from '../entities/payment.entity';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const mockOrderRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepository },
      ],
    }).compile();
    service = module.get<PaymentService>(PaymentService);
  });

  it('debe crear pago', async () => {
    mockOrderRepository.findOneBy.mockResolvedValue({ id: 1 });
    mockPaymentRepository.create.mockReturnValue({ id: 3 });
    mockPaymentRepository.save.mockResolvedValue({ id: 3 });

    const result = await service.create({
      orderId: 1,
      amount: 100,
      paymentMethod: 'cash' as never,
      status: 'pending' as never,
    });
    expect(result.id).toBe(3);
  });

  it('debe fallar si orden no existe', async () => {
    mockOrderRepository.findOneBy.mockResolvedValue(null);
    await expect(
      service.create({
        orderId: 99,
        amount: 100,
        paymentMethod: 'cash' as never,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
