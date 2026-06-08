import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  findByProduct(@Query('productId', ParseIntPipe) productId: number) {
    return this.reviewService.findByProduct(productId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createReviewDto: CreateReviewDto, @Req() request: RequestWithUser) {
    if (!request.user?.id) {
      throw new BadRequestException('Could not identify the authenticated user');
    }

    return this.reviewService.create(
      createReviewDto.productId,
      request.user.id,
      createReviewDto,
    );
  }
}
