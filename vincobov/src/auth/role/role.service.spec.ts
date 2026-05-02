import { ConflictException, NotFoundException } from '@nestjs/common';

import { RoleService } from './role.service';

describe('RoleService', () => {
  const mockRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  let service: RoleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoleService(mockDataSource as never);
  });

  it('debe crear un rol', async () => {
    mockRepository.findOneBy.mockResolvedValueOnce(null);
    mockRepository.create.mockReturnValue({ id: 1, name: 'admin' });
    mockRepository.save.mockResolvedValue({ id: 1, name: 'admin' });

    const result = await service.create({ name: 'admin', description: 'x' });
    expect(result.name).toBe('admin');
  });

  it('debe lanzar conflicto si existe', async () => {
    mockRepository.findOneBy.mockResolvedValue({ id: 1, name: 'admin' });
    await expect(
      service.create({ name: 'admin', description: 'x' }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe lanzar not found en findOne', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);
    await expect(service.findOne(10)).rejects.toThrow(NotFoundException);
  });
});
