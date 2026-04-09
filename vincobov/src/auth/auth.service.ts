import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: any) {
        const { email, password } = loginDto;

        // Buscamos al usuario por email
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password'], // Pedimos el password para comparar
        });

        // Validamos
        if (!user || !bcrypt.compareSync(password, user.password)) {
            throw new UnauthorizedException('Credenciales no válidas');
        }

        // Generamos el token con ID
        const payload = { id: user.id };

        return {
            user: { id: user.id, email: user.email },
            token: this.jwtService.sign(payload),
        };
    }
}
