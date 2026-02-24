import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Rol } from './entidades/rol.entity';
import { Permiso } from './entidades/permiso.entity';
import { PermisoRol } from './entidades/permiso-rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rol, Permiso, PermisoRol])],
})
export class AuthModule {}
