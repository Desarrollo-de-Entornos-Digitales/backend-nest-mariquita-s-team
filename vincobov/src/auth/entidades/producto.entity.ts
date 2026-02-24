import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Categoria } from './categoria.entity';
import { Usuario } from '../../usuarios/entidades/usuario.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ length: 255 })
  descripcion: string;

  @Column()
  stock: number;

  @Column()
  precio: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.productos)
  @JoinColumn({ name: 'usuario_id' })
  creado_por: Usuario;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;
}
