import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@Entity('usuarios')
export class Usuario {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Column({ length: 255 })
  nombre: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Column({ length: 255, unique: true })
  email: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}
