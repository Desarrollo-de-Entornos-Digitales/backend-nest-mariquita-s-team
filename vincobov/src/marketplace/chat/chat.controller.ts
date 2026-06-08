import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chats')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Permissions('chat:create')
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Post('find-or-create')
  @Permissions('chat:create')
  findOrCreate(@Body() createChatDto: CreateChatDto) {
    return this.chatService.findOrCreate(createChatDto);
  }

  @Get()
  @Permissions('chat:read')
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
  @Permissions('chat:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.findOne(id);
  }

  @Patch(':id')
  @Permissions('chat:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  @Permissions('chat:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.remove(id);
  }
}
