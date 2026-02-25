import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../../pagos/entidades/pago.entity';


@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;


  @Column({ type: 'varchar', length: 255 })
  name: string;


  @Column({ type: 'text' })
  description: string;




  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  payments: Payment[];
}
