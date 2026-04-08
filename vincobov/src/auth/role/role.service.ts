import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly roleRepository: Repository<Role>;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    this.roleRepository = this.dataSource.getRepository(Role);
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.findByName(createRoleDto.name);
    if (existingRole) {
      throw new ConflictException(`El rol "${createRoleDto.name}" ya existe.`);
    }

    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`No se encontro el rol con id ${id}.`);
    }
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    const maybeName = (updateRoleDto as Partial<CreateRoleDto>).name;

    if (maybeName && maybeName !== role.name) {
      const roleWithSameName = await this.findByName(maybeName);
      if (roleWithSameName && roleWithSameName.id !== id) {
        throw new ConflictException(`El rol "${maybeName}" ya existe.`);
      }
    }

    const updatedRole = this.roleRepository.merge(role, updateRoleDto);
    return this.roleRepository.save(updatedRole);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);

    return {
      message: 'Rol eliminado correctamente.',
      id,
    };
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOneBy({ name });
  }
}
