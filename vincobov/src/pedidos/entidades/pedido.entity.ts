import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comprador_id: number;

  @Column()
  vendedor_id: number;

  @Column()
  producto_id: number;

  @Column()
  cantidad: number;

  @Column()
  total_pago: number;

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
