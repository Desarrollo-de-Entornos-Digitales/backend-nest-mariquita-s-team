import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Pedido } from '../../pedidos/entidades/pedido.entity';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Pedido)
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @Column()
  monto: number;
}
