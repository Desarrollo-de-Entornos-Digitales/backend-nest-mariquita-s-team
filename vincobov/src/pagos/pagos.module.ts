import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';


import { Payment } from './entidades/pago.entity';
import { PaymentMethod } from './entidades/paymentMethod.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, PaymentMethod])],
})
export class PagosModule {}
