import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from './rol.entity';
import { Permiso } from './permiso.entity';

@Entity('permiso_rol')
export class PermisoRol {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Rol, (rol) => rol.permisosRol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Permiso, (permiso) => permiso.permisosRol)
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;
}
