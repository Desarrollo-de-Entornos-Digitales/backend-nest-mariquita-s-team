import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../../auth/entities/user.entity';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import {
  Order,
  OrderStatus,
  ShippingStatus,
} from '../../marketplace/entities/order.entity';
import { NotificationsService } from '../../marketplace/notifications/notifications.service';
import { NotificationType } from '../../marketplace/entities/notification.entity';
import { SHIPPING_STAGES } from '../../marketplace/shipping/shipping-stages';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const creator = await this.userRepository.findOneBy({
      id: createProductDto.createdBy,
    });

    if (!creator) {
      throw new NotFoundException(
        `No se encontro el vendedor con ID ${createProductDto.createdBy}`,
      );
    }

    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: creator,
    });
    return await this.productRepository.save(product);
  }

  async findAll(query: FindProductsQueryDto): Promise<Product[]> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.createdBy', 'createdBy')
      .leftJoinAndSelect('createdBy.role', 'createdByRole');

    this.applyFilters(qb, query);

    qb.orderBy('product.createdAt', 'DESC');

    if (query.limit) {
      qb.take(query.limit);
    }

    if (query.offset !== undefined) {
      qb.skip(query.offset);
    }

    return await qb.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy', 'createdBy.role'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { createdBy, ...rest } = updateProductDto;
    let owner: User | undefined;

    if (createdBy) {
      const ownerFound = await this.userRepository.findOneBy({ id: createdBy });
      if (!ownerFound) {
        throw new NotFoundException(
          `No se encontro el vendedor con ID ${createdBy}`,
        );
      }
      owner = ownerFound;
    }

    const product = await this.productRepository.preload({
      id: id,
      ...rest,
      createdBy: owner,
    });

    if (!product) {
      throw new NotFoundException(
        `No se pudo encontrar el producto #${id} para actualizar`,
      );
    }

    return await this.productRepository.save(product);
  }

  async purchase(
    productId: number,
    buyerUserId: number,
    quantity: number,
  ): Promise<{
    message: string;
    productId: number;
    buyerUserId: number;
    quantity: number;
    remainingStock: number;
    orderId: number;
  }> {
    const product = await this.findOne(productId);

    if (product.createdBy.id === buyerUserId) {
      throw new BadRequestException(
        'No puedes comprar un producto publicado por ti mismo',
      );
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponible: ${product.stock}`,
      );
    }

    const buyer = await this.userRepository.findOneBy({ id: buyerUserId });
    if (!buyer) {
      throw new NotFoundException(
        `No se encontro el comprador con id ${buyerUserId}`,
      );
    }

    product.stock -= quantity;
    const savedProduct = await this.productRepository.save(product);

    const unitPrice = Number(product.price);
    const totalPrice = unitPrice * quantity;

    const initialShippingStage = SHIPPING_STAGES[0];

    const order = this.orderRepository.create({
      buyer,
      product,
      quantity,
      unitPrice,
      totalPrice,
      status: OrderStatus.PAID,
      shippingStatus: ShippingStatus.ORDER_CONFIRMED,
      shippingDetails: null,
    });
    const savedOrder = await this.orderRepository.save(order);

    await this.notificationsService.createForUser({
      recipientId: product.createdBy.id,
      type: NotificationType.PURCHASE,
      title: 'New purchase',
      body: `Someone bought ${quantity} unit(s) of "${product.title}".`,
      metadata: {
        productId: product.id,
        orderId: savedOrder.id,
        buyerId: buyerUserId,
      },
    });

    if (initialShippingStage) {
      await this.notificationsService.createForUser({
        recipientId: buyerUserId,
        type: NotificationType.SHIPPING,
        title: initialShippingStage.title,
        body: initialShippingStage.body,
        metadata: {
          productId: product.id,
          orderId: savedOrder.id,
          shippingStatus: initialShippingStage.status,
        },
      });
    }

    return {
      message: 'Purchase completed successfully',
      productId,
      buyerUserId,
      quantity,
      remainingStock: savedProduct.stock,
      orderId: savedOrder.id,
    };
  }

  async remove(id: number): Promise<Product> {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  private applyFilters(
    qb: SelectQueryBuilder<Product>,
    query: FindProductsQueryDto,
  ): void {
    if (query.category) {
      qb.andWhere('product.category = :category', {
        category: query.category,
      });
    }

    if (query.location) {
      qb.andWhere('LOWER(product.location) LIKE :location', {
        location: `%${query.location.toLowerCase()}%`,
      });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.createdBy !== undefined) {
      qb.andWhere('createdBy.id = :createdBy', {
        createdBy: query.createdBy,
      });
    }
  }
}
