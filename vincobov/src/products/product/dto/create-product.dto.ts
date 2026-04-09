import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

import { ProductCategory } from '../../entities/product.entity';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsNumber()
  @Min(1)
  createdBy: number; //any
}
