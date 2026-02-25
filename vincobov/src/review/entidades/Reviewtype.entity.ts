import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('reviewTypes')
export class ReviewType {
    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    name: string;


}
