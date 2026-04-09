import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) { }

    // Crea un nuevo producto
    async create(createProductDto: CreateProductDto) {
        const product = this.productRepository.create({
            ...createProductDto,
            createdBy: { id: createProductDto.createdBy } as unknown as User,
        });
        return await this.productRepository.save(product);
    }

    // Obtiene todos los productos
    async findAll() {
        return await this.productRepository.find({
            relations: ['createdBy'],
        });
    }

    // Busca un producto ID
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

    // Actualiza datos
    async update(id: number, updateProductDto: UpdateProductDto) {
        const { createdBy, ...rest } = updateProductDto;

        const product = await this.productRepository.preload({
            id: id,
            ...rest,
            createdBy: createdBy ? ({ id: createdBy } as unknown as User) : undefined,
        });

        if (!product) {
            throw new NotFoundException(
                `No se pudo encontrar el producto #${id} para actualizar`,
            );
        }

        return await this.productRepository.save(product);
    }

    // Elimina un producto
    async remove(id: number) {
        const product = await this.findOne(id);
        return await this.productRepository.remove(product);
    }
}
