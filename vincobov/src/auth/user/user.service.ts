import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // CREATE
  async create(data: CreateUserDto): Promise<User> {
    const { email, username, password, roleId, bio } = data;

    // validar email único
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    // validar username único
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    // validar rol
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // hash del password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      username,
      bio,
      passwordHash,
      role,
    });

    return await this.userRepository.save(user);
  }

  // READ ALL
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role'],
    });
  }

  //READ ONE
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // UPDATE
  async update(id: number, data: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (data.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: data.email },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (data.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: data.username },
      });

      if (existingUsername && existingUsername.id !== id) {
        throw new BadRequestException('Username already exists');
      }
    }

    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }

    if (data.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: data.roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      user.role = role;
    }

    Object.assign(user, {
      email: data.email ?? user.email,
      username: data.username ?? user.username,
      bio: data.bio ?? user.bio,
    });

    return this.userRepository.save(user);
  }

  // DELETE
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
