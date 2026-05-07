import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

import { PaymentMethod, PaymentStatus } from '../../entities/payment.entity';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  orderId: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
