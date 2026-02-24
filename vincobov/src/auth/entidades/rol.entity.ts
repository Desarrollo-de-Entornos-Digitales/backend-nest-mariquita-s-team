import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Usuario } from '../../usuarios/entidades/usuario.entity';
import { PermisoRol } from './permiso-rol.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ length: 255 })
  descripcion: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @OneToMany(() => PermisoRol, (permisoRol) => permisoRol.rol)
  permisosRol: PermisoRol[];
}
