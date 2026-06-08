import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../entities/product.entity';
import { ProductReview } from '../entities/product-review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductReview, Product, User])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
