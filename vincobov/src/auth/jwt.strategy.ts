import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService, // Inyectamos el configService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Leemos el mismo secreto que definieron en el AuthModule
            secretOrKey: configService.get<string>('JWT_SECRET') ?? 'change_me',
        });
    }

    async validate(payload: { id: number }) {
        const { id } = payload;
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new UnauthorizedException('Token no válido o usuario inexistente');
        }

        return user; // Este usuario se inyectará en req.user
    }
}
