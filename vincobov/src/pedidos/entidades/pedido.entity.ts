import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from '../../usuarios/entidades/usuario.entity';
import { Product } from '../../auth/entidades/producto.entity';
import { Payment } from '../../pagos/entidades/pago.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;

  @Column()
  totalAmount: number;

  @OneToMany(() => Payment, (payment: Payment) => payment.order)
  payments: Payment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
