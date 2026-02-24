import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Rol } from '../../auth/entidades/rol.entity';
import { Producto } from '../../auth/entidades/producto.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ length: 255, unique: true })
  email: string;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @OneToMany(() => Producto, (producto) => producto.creado_por)
  productos: Producto[];

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}
