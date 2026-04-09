import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user/entities/user.entity'; // Ruta según tu estructura

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'CLAVE_SECRETA_VINCOBOV_2026', // Debe coincidir con el modulo
    });
  }

  // Si el token es válido, extraemos el ID y buscamos al usuario
  async validate(payload: { id: number }) {
    const { id } = payload;
    const user: User | null = await this.userRepository.findOneBy({ id });

    if (!user) throw new UnauthorizedException('Token no válido');
    
    // Retornamos el usuario para que Nest lo ponga en el Request
    return user;
  }
}