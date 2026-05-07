import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

import { OrderStatus } from '../../entities/order.entity';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  buyerId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
