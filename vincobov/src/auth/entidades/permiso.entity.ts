import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { RolePermission } from './permiso-rol.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission: RolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
