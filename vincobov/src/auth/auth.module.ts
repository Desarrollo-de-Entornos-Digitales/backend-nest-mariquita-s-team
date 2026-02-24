import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from './entidades/rol.entity';
import { Permission } from './entidades/permiso.entity';
import { RolePermission } from './entidades/permiso-rol.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
})
export class AuthModule {}
