import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../auth/entities/user.entity';

export enum ProductCategory {
  LIVESTOCK = 'livestock',
  // Deprecated: legacy value kept for backward compatibility with existing DB data.
  CROP = 'crop',
  AGRICULTURE = 'agriculture',
  REFINED = 'refined',
  SUPPLIES_EQUIPMENT = 'supplies_equipment',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  title: string;

  @Column({ length: 500 })
  description: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ length: 120, nullable: true })
  location: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
