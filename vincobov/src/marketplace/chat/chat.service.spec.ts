import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../../auth/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  const mockChatRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const mockUserRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Chat), useValue: mockChatRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();
    service = module.get<ChatService>(ChatService);
  });

  it('debe fallar si seller y buyer son iguales', async () => {
    await expect(service.create({ sellerId: 1, buyerId: 1 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe crear chat', async () => {
    mockUserRepository.findOneBy
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({
        id: 2,
      });
    mockChatRepository.create.mockReturnValue({ id: 1 });
    mockChatRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create({ sellerId: 1, buyerId: 2 });
    expect(result.id).toBe(1);
  });

  it('debe fallar si no existe seller', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    await expect(service.create({ sellerId: 10, buyerId: 2 })).rejects.toThrow(
      NotFoundException,
    );
  });
});
