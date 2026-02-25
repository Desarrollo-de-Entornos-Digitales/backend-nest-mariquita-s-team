import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';


import { Order } from '../../pedidos/entidades/pedido.entity';
import { User } from '../../usuarios/entidades/usuario.entity';
import { ReviewType } from './Reviewtype.entity';


@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;


  @ManyToOne(() => ReviewType)
  @JoinColumn({ name: 'review_type_id' })
  reviewType: ReviewType;


  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;


  @ManyToOne(() => User)
  @JoinColumn({ name: 'target_id' })
  target: User;


  @Column('int')
  rating: number;


  @Column('string')
  comment: string;


  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}


export { ReviewType };
