import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteService } from './favorite.service';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('favorites')
@UseGuards(AuthGuard('jwt'))
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  findMine(@Req() request: RequestWithUser) {
    if (!request.user?.id) {
      throw new BadRequestException('Could not identify the authenticated user');
    }
    return this.favoriteService.findByUser(request.user.id);
  }

  @Get('check')
  check(
    @Query('productId', ParseIntPipe) productId: number,
    @Req() request: RequestWithUser,
  ) {
    if (!request.user?.id) {
      throw new BadRequestException('Could not identify the authenticated user');
    }
    return this.favoriteService.isFavorite(request.user.id, productId);
  }

  @Post()
  create(@Body() createFavoriteDto: CreateFavoriteDto, @Req() request: RequestWithUser) {
    if (!request.user?.id) {
      throw new BadRequestException('Could not identify the authenticated user');
    }
    return this.favoriteService.create(request.user.id, createFavoriteDto.productId);
  }

  @Delete()
  remove(
    @Query('productId', ParseIntPipe) productId: number,
    @Req() request: RequestWithUser,
  ) {
    if (!request.user?.id) {
      throw new BadRequestException('Could not identify the authenticated user');
    }
    return this.favoriteService.remove(request.user.id, productId);
  }
}
