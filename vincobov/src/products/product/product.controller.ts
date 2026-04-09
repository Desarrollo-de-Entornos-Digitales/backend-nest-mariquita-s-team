import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { PurchaseProductDto } from './dto/purchase-product.dto';

interface RequestWithUser {
  user?: {
    id?: number;
  };
}

@Controller('product')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Permissions('product:create')
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @Permissions('product:read')
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @Permissions('product:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Permissions('product:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Post(':id/purchase')
  @Permissions('product:purchase')
  purchase(
    @Param('id', ParseIntPipe) id: number,
    @Body() purchaseProductDto: PurchaseProductDto,
    @Req() request: RequestWithUser,
  ) {
    if (!request.user?.id) {
      throw new BadRequestException('No se pudo identificar el comprador');
    }

    return this.productService.purchase(
      id,
      request.user.id,
      purchaseProductDto.quantity,
    );
  }

  @Delete(':id')
  @Permissions('product:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
