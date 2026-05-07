import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from '../entities/order.entity';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepository.findOneBy({
      id: createPaymentDto.orderId,
    });
    if (!order) {
      throw new NotFoundException(
        `No se encontro la orden con id ${createPaymentDto.orderId}`,
      );
    }

    const payment = this.paymentRepository.create({
      order,
      amount: createPaymentDto.amount,
      paymentMethod: createPaymentDto.paymentMethod,
      status: createPaymentDto.status ?? PaymentStatus.PENDING,
    });
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order'],
    });
    if (!payment) {
      throw new NotFoundException(`Pago con id ${id} no encontrado`);
    }
    return payment;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);

    if (updatePaymentDto.orderId) {
      const order = await this.orderRepository.findOneBy({
        id: updatePaymentDto.orderId,
      });
      if (!order) {
        throw new NotFoundException(
          `No se encontro la orden con id ${updatePaymentDto.orderId}`,
        );
      }
      payment.order = order;
    }

    payment.amount = updatePaymentDto.amount ?? payment.amount;
    payment.paymentMethod =
      updatePaymentDto.paymentMethod ?? payment.paymentMethod;
    payment.status = updatePaymentDto.status ?? payment.status;

    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
    return { message: 'Pago eliminado correctamente', id };
  }
}
