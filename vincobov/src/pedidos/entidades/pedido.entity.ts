import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { Usuario } from '../../usuarios/entidades/usuario.entity';
import { Producto } from '../../auth/entidades/producto.entity';
import { Pago } from '../../pagos/entidades/pago.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'comprador_id' })
  comprador: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: Usuario;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  cantidad: number;

  @Column()
  total_pago: number;

  @OneToMany(() => Pago, (pago) => pago.pedido)
  pagos: Pago[];

  @CreateDateColumn({ type: 'timestamp' })
  fecha_creacion: Date;
}
