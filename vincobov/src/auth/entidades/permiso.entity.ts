import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { PermisoRol } from './permiso-rol.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255 })
  description: string;

  @OneToMany(() => PermisoRol, (permisoRol) => permisoRol.permiso)
  permisosRol: PermisoRol[];
}
