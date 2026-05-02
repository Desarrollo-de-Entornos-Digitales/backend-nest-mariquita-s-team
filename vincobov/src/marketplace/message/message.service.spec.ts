import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from '../../auth/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const mockChatRepository = { findOne: jest.fn() };
  const mockUserRepository = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        { provide: getRepositoryToken(Chat), useValue: mockChatRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();
    service = module.get<MessageService>(MessageService);
  });

  it('debe crear mensaje', async () => {
    mockChatRepository.findOne.mockResolvedValue({
      id: 1,
      seller: { id: 2 },
      buyer: { id: 3 },
    });
    mockUserRepository.findOneBy.mockResolvedValue({ id: 2 });
    mockMessageRepository.create.mockReturnValue({ id: 1 });
    mockMessageRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create({
      chatId: 1,
      senderId: 2,
      content: 'hola',
    });
    expect(result.id).toBe(1);
  });

  it('debe fallar si chat no existe', async () => {
    mockChatRepository.findOne.mockResolvedValue(null);
    await expect(
      service.create({ chatId: 1, senderId: 2, content: 'hola' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('debe fallar si sender no pertenece al chat', async () => {
    mockChatRepository.findOne.mockResolvedValue({
      id: 1,
      seller: { id: 2 },
      buyer: { id: 3 },
    });
    mockUserRepository.findOneBy.mockResolvedValue({ id: 4 });
    await expect(
      service.create({ chatId: 1, senderId: 4, content: 'hola' }),
    ).rejects.toThrow(BadRequestException);
  });
});
