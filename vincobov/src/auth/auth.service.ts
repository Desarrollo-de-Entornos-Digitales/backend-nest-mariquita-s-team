import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

export interface AuthLoginResponse {
  user: {
    id: number;
    email: string;
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: UserLoginDto): Promise<AuthLoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      where: { email },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales no válidas');
    }

    const permissions =
      user.role?.rolePermissions?.map(
        (rolePermission) => rolePermission.permission.name,
      ) ?? [];

    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      permissions,
    };

    return {
      user: { id: user.id, email: user.email },
      access_token: this.jwtService.sign(payload),
    };
  }
}
