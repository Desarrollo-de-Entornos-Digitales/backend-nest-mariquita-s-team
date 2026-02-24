import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Role } from '../../auth/entidades/rol.entity';
import { Product } from '../../auth/entidades/producto.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Product, (product: Product) => product.createdBy)
  products: Product[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
