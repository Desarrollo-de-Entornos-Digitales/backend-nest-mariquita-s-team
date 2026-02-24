import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entidades/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsuariosModule {}
