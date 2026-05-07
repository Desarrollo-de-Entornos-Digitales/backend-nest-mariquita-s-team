import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../../auth/entities/user.entity';
import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const creator = await this.userRepository.findOneBy({
      id: createProductDto.createdBy,
    });

    if (!creator) {
      throw new NotFoundException(
        `No se encontro el vendedor con ID ${createProductDto.createdBy}`,
      );
    }

    const product = this.productRepository.create({
      ...createProductDto,
      createdBy: creator,
    });
    return await this.productRepository.save(product);
  }

  async findAll(query: FindProductsQueryDto): Promise<Product[]> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.createdBy', 'createdBy');

    this.applyFilters(qb, query);

    qb.orderBy('product.createdAt', 'DESC');

    if (query.limit) {
      qb.take(query.limit);
    }

    if (query.offset !== undefined) {
      qb.skip(query.offset);
    }

    return await qb.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { createdBy, ...rest } = updateProductDto;
    let owner: User | undefined;

    if (createdBy) {
      const ownerFound = await this.userRepository.findOneBy({ id: createdBy });
      if (!ownerFound) {
        throw new NotFoundException(
          `No se encontro el vendedor con ID ${createdBy}`,
        );
      }
      owner = ownerFound;
    }

    const product = await this.productRepository.preload({
      id: id,
      ...rest,
      createdBy: owner,
    });

    if (!product) {
      throw new NotFoundException(
        `No se pudo encontrar el producto #${id} para actualizar`,
      );
    }

    return await this.productRepository.save(product);
  }

  async purchase(
    productId: number,
    buyerUserId: number,
    quantity: number,
  ): Promise<{
    message: string;
    productId: number;
    buyerUserId: number;
    quantity: number;
    remainingStock: number;
  }> {
    const product = await this.findOne(productId);

    if (product.createdBy.id === buyerUserId) {
      throw new BadRequestException(
        'No puedes comprar un producto publicado por ti mismo',
      );
    }

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponible: ${product.stock}`,
      );
    }

    product.stock -= quantity;
    const savedProduct = await this.productRepository.save(product);

    return {
      message: 'Compra registrada exitosamente',
      productId,
      buyerUserId,
      quantity,
      remainingStock: savedProduct.stock,
    };
  }

  async remove(id: number): Promise<Product> {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }

  private applyFilters(
    qb: SelectQueryBuilder<Product>,
    query: FindProductsQueryDto,
  ): void {
    if (query.category) {
      qb.andWhere('product.category = :category', {
        category: query.category,
      });
    }

    if (query.location) {
      qb.andWhere('LOWER(product.location) LIKE :location', {
        location: `%${query.location.toLowerCase()}%`,
      });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }
  }
}
