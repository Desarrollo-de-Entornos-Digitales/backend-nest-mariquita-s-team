import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Notification, NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listForUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipient: { id: userId } },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async createForUser(params: {
    recipientId: number;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<Notification> {
    const user = await this.userRepository.findOneBy({ id: params.recipientId });
    if (!user) {
      throw new NotFoundException(
        `No se encontro el usuario con id ${params.recipientId}`,
      );
    }
    const notification = this.notificationRepository.create({
      recipient: user,
      type: params.type,
      title: params.title,
      body: params.body,
      metadata: params.metadata ?? null,
      readAt: null,
    });
    return this.notificationRepository.save(notification);
  }

  async markRead(userId: number, id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['recipient'],
    });
    if (!notification || notification.recipient.id !== userId) {
      throw new NotFoundException(`Notificacion ${id} no encontrada`);
    }
    notification.readAt = notification.readAt ?? new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllRead(userId: number): Promise<{ message: string }> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('recipient_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();
    return { message: 'OK' };
  }
}

