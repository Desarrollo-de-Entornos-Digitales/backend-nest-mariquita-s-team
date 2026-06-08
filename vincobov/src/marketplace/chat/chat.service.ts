import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreate(createChatDto: CreateChatDto): Promise<Chat> {
    const existing = await this.chatRepository.findOne({
      where: {
        seller: { id: createChatDto.sellerId },
        buyer: { id: createChatDto.buyerId },
      },
      relations: ['seller', 'buyer'],
    });

    if (existing) {
      return existing;
    }

    return this.create(createChatDto);
  }

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    if (createChatDto.sellerId === createChatDto.buyerId) {
      throw new BadRequestException(
        'El vendedor y comprador deben ser usuarios diferentes',
      );
    }

    const seller = await this.userRepository.findOneBy({
      id: createChatDto.sellerId,
    });
    if (!seller) {
      throw new NotFoundException(
        `No se encontro el vendedor con id ${createChatDto.sellerId}`,
      );
    }

    const buyer = await this.userRepository.findOneBy({
      id: createChatDto.buyerId,
    });
    if (!buyer) {
      throw new NotFoundException(
        `No se encontro el comprador con id ${createChatDto.buyerId}`,
      );
    }

    const chat = this.chatRepository.create({ seller, buyer });
    return this.chatRepository.save(chat);
  }

  async findAll(): Promise<Chat[]> {
    return this.chatRepository.find({
      relations: ['seller', 'buyer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['seller', 'buyer'],
    });
    if (!chat) {
      throw new NotFoundException(`Chat con id ${id} no encontrado`);
    }
    return chat;
  }

  async update(id: number, updateChatDto: UpdateChatDto): Promise<Chat> {
    const chat = await this.findOne(id);

    const sellerId = updateChatDto.sellerId ?? chat.seller.id;
    const buyerId = updateChatDto.buyerId ?? chat.buyer.id;

    if (sellerId === buyerId) {
      throw new BadRequestException(
        'El vendedor y comprador deben ser usuarios diferentes',
      );
    }

    if (updateChatDto.sellerId) {
      const seller = await this.userRepository.findOneBy({
        id: updateChatDto.sellerId,
      });
      if (!seller) {
        throw new NotFoundException(
          `No se encontro el vendedor con id ${updateChatDto.sellerId}`,
        );
      }
      chat.seller = seller;
    }

    if (updateChatDto.buyerId) {
      const buyer = await this.userRepository.findOneBy({
        id: updateChatDto.buyerId,
      });
      if (!buyer) {
        throw new NotFoundException(
          `No se encontro el comprador con id ${updateChatDto.buyerId}`,
        );
      }
      chat.buyer = buyer;
    }

    return this.chatRepository.save(chat);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const chat = await this.findOne(id);
    await this.chatRepository.remove(chat);
    return { message: 'Chat eliminado correctamente', id };
  }
}
