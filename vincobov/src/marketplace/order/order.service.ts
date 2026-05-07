import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order, OrderStatus } from '../entities/order.entity';
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
      relations: ['buyer', 'product'],
      order: { createdAt: 'DESC' },
    });
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
