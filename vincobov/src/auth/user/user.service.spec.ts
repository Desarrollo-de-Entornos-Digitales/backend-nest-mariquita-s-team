import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('debe crear usuario', async () => {
    mockUserRepository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    mockRoleRepository.findOne.mockResolvedValue({ id: 1, name: 'admin' });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
    mockUserRepository.create.mockReturnValue({ id: 1 });
    mockUserRepository.save.mockResolvedValue({ id: 1 });

    const result = await service.create({
      email: 'a@a.com',
      username: 'aa',
      password: '123456',
      roleId: 1,
      bio: 'x',
    });

    expect(result).toEqual({ id: 1 });
  });

  it('debe fallar si email existe', async () => {
    mockUserRepository.findOne.mockResolvedValueOnce({ id: 7 });
    await expect(
      service.create({
        email: 'a@a.com',
        username: 'aa',
        password: '123456',
        roleId: 1,
        bio: 'x',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe fallar findOne si no existe', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });
});
