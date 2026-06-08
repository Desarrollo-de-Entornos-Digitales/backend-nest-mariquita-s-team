import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Favorite } from '../entities/favorite.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUser(userId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, productId: number): Promise<Favorite> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
      relations: ['product', 'product.createdBy'],
    });
    if (existing) {
      return existing;
    }

    const favorite = this.favoriteRepository.create({ user, product });
    return this.favoriteRepository.save(favorite);
  }

  async remove(userId: number, productId: number): Promise<{ message: string }> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Favorite removed successfully' };
  }

  async isFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    return Boolean(favorite);
  }
}
