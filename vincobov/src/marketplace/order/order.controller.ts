import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('orders')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Permissions('order:create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @Permissions('order:read')
  findAll() {
    return this.orderService.findAll();
  }

  @Get('seller/me')
  @Permissions('order:read')
  findMineAsSeller(@Req() request: RequestWithUser) {
    const sellerId = request.user?.id;
    if (!sellerId) {
      throw new BadRequestException('No se pudo identificar al vendedor');
    }
    return this.orderService.findBySeller(sellerId);
  }

  @Get('buyer/me')
  @Permissions('order:read')
  findMineAsBuyer(@Req() request: RequestWithUser) {
    const buyerId = request.user?.id;
    if (!buyerId) {
      throw new BadRequestException('No se pudo identificar al comprador');
    }
    return this.orderService.findByBuyer(buyerId);
  }

  @Post(':id/advance-shipping')
  @Permissions('order:read')
  advanceShipping(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: RequestWithUser,
  ) {
    const buyerId = request.user?.id;
    if (!buyerId) {
      throw new BadRequestException('No se pudo identificar al comprador');
    }
    return this.orderService.advanceShipping(id, buyerId);
  }

  @Get(':id')
  @Permissions('order:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @Permissions('order:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Permissions('order:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.remove(id);
  }
}
