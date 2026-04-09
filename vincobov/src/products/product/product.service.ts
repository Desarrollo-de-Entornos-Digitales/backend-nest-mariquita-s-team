import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Crea un nuevo producto (livestock, crop o refined)
  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create({
      ...createProductDto,
      // Asignamos el ID del usuario que crea el producto
      createdBy: { id: createProductDto.createdBy } as { id: number },
    });
    return await this.productRepository.save(product);
  }

  // Obtiene todos los productos disponibles en VincoBov
  async findAll() {
    return await this.productRepository.find({
      relations: ['createdBy'], // Incluye info del vendedor
    });
  }

  // Busca un producto específico por su ID numérico
  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  // Actualiza datos como precio o stock
  async update(id: number, updateProductDto: UpdateProductDto) {
    // Si se proporciona createdBy, lo convertimos a objeto con id
    const preloadData: any = {
      id: id,
      ...updateProductDto,
    };
    if (updateProductDto.createdBy) {
      preloadData.createdBy = { id: updateProductDto.createdBy } as { id: number };
    }

    const product = await this.productRepository.preload(preloadData);
    if (!product) {
      throw new NotFoundException(
        `No se pudo encontrar el producto #${id} para actualizar`,
      );
    }
    return await this.productRepository.save(product);
  }

  // Elimina un producto del marketplace
  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }
}
