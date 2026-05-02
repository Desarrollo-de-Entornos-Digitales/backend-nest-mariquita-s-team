import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('debe autenticar y retornar token', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'admin@vincobov.com',
      passwordHash: 'hash',
      role: { rolePermissions: [{ permission: { name: 'user:read' } }] },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login({
      email: 'admin@vincobov.com',
      password: 'Admin123*',
    });

    expect(result.access_token).toBe('mock-token');
    expect(result.user.email).toBe('admin@vincobov.com');
  });

  it('debe fallar si no existe usuario', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'x@x.com', password: '123456' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
