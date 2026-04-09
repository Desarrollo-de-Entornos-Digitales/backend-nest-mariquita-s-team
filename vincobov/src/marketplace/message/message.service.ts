import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../auth/entities/user.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: createMessageDto.chatId },
      relations: ['seller', 'buyer'],
    });
    if (!chat) {
      throw new NotFoundException(
        `No se encontro el chat con id ${createMessageDto.chatId}`,
      );
    }

    const sender = await this.userRepository.findOneBy({
      id: createMessageDto.senderId,
    });
    if (!sender) {
      throw new NotFoundException(
        `No se encontro el remitente con id ${createMessageDto.senderId}`,
      );
    }

    if (sender.id !== chat.seller.id && sender.id !== chat.buyer.id) {
      throw new BadRequestException(
        'El remitente no pertenece a la conversacion',
      );
    }

    const message = this.messageRepository.create({
      chat,
      sender,
      content: createMessageDto.content,
    });
    return this.messageRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['chat', 'sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['chat', 'sender'],
    });
    if (!message) {
      throw new NotFoundException(`Mensaje con id ${id} no encontrado`);
    }
    return message;
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.findOne(id);

    let chat = message.chat;
    if (updateMessageDto.chatId) {
      const chatFound = await this.chatRepository.findOne({
        where: { id: updateMessageDto.chatId },
        relations: ['seller', 'buyer'],
      });
      if (!chatFound) {
        throw new NotFoundException(
          `No se encontro el chat con id ${updateMessageDto.chatId}`,
        );
      }
      chat = chatFound;
      message.chat = chatFound;
    }

    if (updateMessageDto.senderId) {
      const sender = await this.userRepository.findOneBy({
        id: updateMessageDto.senderId,
      });
      if (!sender) {
        throw new NotFoundException(
          `No se encontro el remitente con id ${updateMessageDto.senderId}`,
        );
      }

      if (sender.id !== chat.seller.id && sender.id !== chat.buyer.id) {
        throw new BadRequestException(
          'El remitente no pertenece a la conversacion',
        );
      }

      message.sender = sender;
    }

    if (updateMessageDto.content) {
      message.content = updateMessageDto.content;
    }

    return this.messageRepository.save(message);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const message = await this.findOne(id);
    await this.messageRepository.remove(message);
    return { message: 'Mensaje eliminado correctamente', id };
  }
}
