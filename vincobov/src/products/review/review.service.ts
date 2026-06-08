import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../entities/product.entity';
import { ProductReview } from '../entities/product-review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByProduct(productId: number): Promise<ProductReview[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    productId: number,
    userId: number,
    data: CreateReviewDto,
  ): Promise<ProductReview> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const review = this.reviewRepository.create({
      product,
      user,
      rating: data.rating,
      comment: data.comment,
    });

    return this.reviewRepository.save(review);
  }
}
