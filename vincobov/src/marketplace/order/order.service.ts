import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { NotificationType } from '../entities/notification.entity';
import { Order, OrderStatus, ShippingStatus } from '../entities/order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  SHIPPING_STAGES,
  getNextShippingStage,
  getShippingStageIndex,
} from '../shipping/shipping-stages';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const buyer = await this.userRepository.findOneBy({
      id: createOrderDto.buyerId,
    });
    if (!buyer) {
      throw new NotFoundException(
        `No se encontro el comprador con id ${createOrderDto.buyerId}`,
      );
    }

    const product = await this.productRepository.findOneBy({
      id: createOrderDto.productId,
    });
    if (!product) {
      throw new NotFoundException(
        `No se encontro el producto con id ${createOrderDto.productId}`,
      );
    }

    const quantity = createOrderDto.quantity;
    const unitPrice = createOrderDto.unitPrice;
    const totalPrice = quantity * unitPrice;

    const order = this.orderRepository.create({
      buyer,
      product,
      quantity,
      unitPrice,
      totalPrice,
      status: createOrderDto.status ?? OrderStatus.PENDING,
    });
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['buyer', 'product', 'product.createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySeller(sellerId: number): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.product', 'product')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .where('createdBy.id = :sellerId', { sellerId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async findByBuyer(buyerId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { buyer: { id: buyerId } },
      relations: ['buyer', 'product', 'product.createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForBuyer(orderId: number, buyerId: number): Promise<Order> {
    const order = await this.findOne(orderId);
    if (order.buyer.id !== buyerId) {
      throw new ForbiddenException('You do not have access to this order.');
    }
    return order;
  }

  async advanceShipping(orderId: number, buyerId: number) {
    const order = await this.findOneForBuyer(orderId, buyerId);
    const currentIndex = getShippingStageIndex(order.shippingStatus);
    const nextStage = getNextShippingStage(order.shippingStatus);

    if (!nextStage || currentIndex >= SHIPPING_STAGES.length - 1) {
      return {
        order,
        completed: order.shippingStatus === ShippingStatus.DELIVERED,
        notification: null,
      };
    }

    order.shippingStatus = nextStage.status;
    const savedOrder = await this.orderRepository.save(order);

    const notification = await this.notificationsService.createForUser({
      recipientId: buyerId,
      type: NotificationType.SHIPPING,
      title: nextStage.title,
      body: nextStage.body,
      metadata: {
        orderId: savedOrder.id,
        shippingStatus: nextStage.status,
        productId: savedOrder.product.id,
      },
    });

    return {
      order: savedOrder,
      notification,
      completed: nextStage.status === ShippingStatus.DELIVERED,
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['buyer', 'product'],
    });
    if (!order) {
      throw new NotFoundException(`Orden con id ${id} no encontrada`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateOrderDto.buyerId) {
      const buyer = await this.userRepository.findOneBy({
        id: updateOrderDto.buyerId,
      });
      if (!buyer) {
        throw new NotFoundException(
          `No se encontro el comprador con id ${updateOrderDto.buyerId}`,
        );
      }
      order.buyer = buyer;
    }

    if (updateOrderDto.productId) {
      const product = await this.productRepository.findOneBy({
        id: updateOrderDto.productId,
      });
      if (!product) {
        throw new NotFoundException(
          `No se encontro el producto con id ${updateOrderDto.productId}`,
        );
      }
      order.product = product;
    }

    if (updateOrderDto.status) {
      order.status = updateOrderDto.status;
    }

    order.quantity = updateOrderDto.quantity ?? order.quantity;
    order.unitPrice = updateOrderDto.unitPrice ?? order.unitPrice;
    order.totalPrice = order.quantity * order.unitPrice;

    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
    return { message: 'Orden eliminada correctamente', id };
  }
}
