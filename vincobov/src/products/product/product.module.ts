import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../entities/product.entity';
import { User } from '../../auth/entities/user.entity';
import { Order } from '../../marketplace/entities/order.entity';
import { NotificationsModule } from '../../marketplace/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Order]),
    NotificationsModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
