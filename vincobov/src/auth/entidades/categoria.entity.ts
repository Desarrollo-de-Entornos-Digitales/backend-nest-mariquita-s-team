import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { Producto } from './producto.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  nombre: string;

  @Column({ length: 255 })
  descripcion: string;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos: Producto[];
}
