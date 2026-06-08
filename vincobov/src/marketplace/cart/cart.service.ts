import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order, OrderStatus, ShippingStatus } from '../entities/order.entity';
import { SHIPPING_STAGES } from '../shipping/shipping-stages';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class CartService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getOrCreateCart(buyerId: number): Promise<Cart> {
    const buyer = await this.userRepository.findOneBy({ id: buyerId });
    if (!buyer) {
      throw new NotFoundException(
        `No se encontro el usuario con id ${buyerId}`,
      );
    }

    let cart = await this.cartRepository.findOne({
      where: { buyer: { id: buyerId } },
      relations: ['buyer', 'items', 'items.product', 'items.product.createdBy'],
      order: { items: { createdAt: 'ASC' } },
    });
    if (!cart) {
      cart = this.cartRepository.create({ buyer, items: [] });
      cart = await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(buyerId: number): Promise<Cart> {
    return this.getOrCreateCart(buyerId);
  }

  async addItem(
    buyerId: number,
    productId: number,
    quantity: number,
  ): Promise<Cart> {
    if (quantity < 1) {
      throw new BadRequestException('La cantidad debe ser >= 1');
    }

    const cart = await this.getOrCreateCart(buyerId);
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(
        `No se encontro el producto con id ${productId}`,
      );
    }

    const existing = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
      relations: ['cart', 'product', 'product.createdBy'],
    });

    const nextQty = (existing?.quantity ?? 0) + quantity;
    if (product.stock < nextQty) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    if (existing) {
      existing.quantity = nextQty;
      existing.unitPrice = Number(product.price);
      existing.updatedAt = new Date();
      await this.cartItemRepository.save(existing);
    } else {
      const item = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        unitPrice: Number(product.price),
      });
      await this.cartItemRepository.save(item);
    }

    await this.cartRepository.update(cart.id, { updatedAt: new Date() });
    return this.getCart(buyerId);
  }

  async updateItem(
    buyerId: number,
    itemId: number,
    quantity: number,
  ): Promise<Cart> {
    if (quantity < 1) {
      throw new BadRequestException('La cantidad debe ser >= 1');
    }

    const cart = await this.getOrCreateCart(buyerId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'product', 'product.createdBy'],
    });
    if (!item || item.cart.id !== cart.id) {
      throw new NotFoundException(`Item de carrito ${itemId} no encontrado`);
    }

    const product = await this.productRepository.findOneBy({
      id: item.product.id,
    });
    if (!product) {
      throw new NotFoundException(
        `No se encontro el producto con id ${item.product.id}`,
      );
    }
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Disponible: ${product.stock}`,
      );
    }

    item.quantity = quantity;
    item.unitPrice = Number(product.price);
    item.updatedAt = new Date();
    await this.cartItemRepository.save(item);
    await this.cartRepository.update(cart.id, { updatedAt: new Date() });
    return this.getCart(buyerId);
  }

  async removeItem(buyerId: number, itemId: number): Promise<Cart> {
    const cart = await this.getOrCreateCart(buyerId);
    const item = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });
    if (!item || item.cart.id !== cart.id) {
      throw new NotFoundException(`Item de carrito ${itemId} no encontrado`);
    }

    await this.cartItemRepository.remove(item);
    await this.cartRepository.update(cart.id, { updatedAt: new Date() });
    return this.getCart(buyerId);
  }

  async checkout(
    buyerId: number,
  ): Promise<{ message: string; orderIds: number[] }> {
    const cart = await this.getOrCreateCart(buyerId);
    const items = await this.cartItemRepository.find({
      where: { cart: { id: cart.id } },
      relations: ['product', 'product.createdBy'],
      order: { createdAt: 'ASC' },
    });

    if (items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const buyer = await this.userRepository.findOneBy({ id: buyerId });
    if (!buyer) {
      throw new NotFoundException(
        `No se encontro el comprador con id ${buyerId}`,
      );
    }

    const orderIds: number[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: { id: item.product.id },
          relations: ['createdBy'],
        });
        if (!product) {
          throw new NotFoundException(
            `No se encontro el producto con id ${item.product.id}`,
          );
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.title}. Disponible: ${product.stock}`,
          );
        }

        product.stock -= item.quantity;
        await manager.save(Product, product);

        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * item.quantity;

        const initialShippingStage = SHIPPING_STAGES[0];

        const order = manager.create(Order, {
          buyer,
          product,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          status: OrderStatus.PAID,
          shippingStatus: ShippingStatus.ORDER_CONFIRMED,
          shippingDetails: null,
        });
        const saved = await manager.save(Order, order);
        orderIds.push(saved.id);

        await this.notificationsService.createForUser({
          recipientId: product.createdBy.id,
          type: NotificationType.PURCHASE,
          title: 'New purchase',
          body: `Someone bought ${item.quantity} unit(s) of "${product.title}".`,
          metadata: { productId: product.id, orderId: saved.id, buyerId },
        });

        if (initialShippingStage) {
          await this.notificationsService.createForUser({
            recipientId: buyerId,
            type: NotificationType.SHIPPING,
            title: initialShippingStage.title,
            body: initialShippingStage.body,
            metadata: {
              productId: product.id,
              orderId: saved.id,
              shippingStatus: initialShippingStage.status,
            },
          });
        }
      }

      await manager.delete(CartItem, { cart: { id: cart.id } });
      await manager.update(Cart, cart.id, { updatedAt: new Date() });
    });

    return { message: 'Checkout completed', orderIds };
  }
}
