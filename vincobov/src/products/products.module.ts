import { Module } from '@nestjs/common';

import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [ProductModule, ReviewModule],
})
export class ProductsModule {}
