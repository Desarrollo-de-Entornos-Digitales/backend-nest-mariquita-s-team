import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pedido_id: number;

  @Column()
  monto: number;
}
