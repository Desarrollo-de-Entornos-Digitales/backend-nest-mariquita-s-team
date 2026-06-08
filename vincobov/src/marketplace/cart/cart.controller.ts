import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('cart')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Permissions('cart:read')
  getCart(@Req() request: RequestWithUser) {
    const userId = request.user?.id;
    return this.cartService.getCart(userId ?? 0);
  }

  @Post('items')
  @Permissions('cart:update')
  addItem(@Body() dto: AddCartItemDto, @Req() request: RequestWithUser) {
    const userId = request.user?.id;
    return this.cartService.addItem(userId ?? 0, dto.productId, dto.quantity);
  }

  @Patch('items/:id')
  @Permissions('cart:update')
  updateItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.user?.id;
    return this.cartService.updateItem(userId ?? 0, itemId, dto.quantity);
  }

  @Delete('items/:id')
  @Permissions('cart:update')
  removeItem(
    @Param('id', ParseIntPipe) itemId: number,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.user?.id;
    return this.cartService.removeItem(userId ?? 0, itemId);
  }

  @Post('checkout')
  @Permissions('cart:checkout')
  checkout(@Req() request: RequestWithUser) {
    const userId = request.user?.id;
    return this.cartService.checkout(userId ?? 0);
  }
}
