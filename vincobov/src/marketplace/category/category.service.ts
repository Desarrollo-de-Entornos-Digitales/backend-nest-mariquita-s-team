import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findOneBy({
      name: createCategoryDto.name,
    });
    if (existing) {
      throw new ConflictException(
        `La categoria "${createCategoryDto.name}" ya existe`,
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Categoria con id ${id} no encontrada`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOneBy({
        name: updateCategoryDto.name,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `La categoria "${updateCategoryDto.name}" ya existe`,
        );
      }
    }

    const updated = this.categoryRepository.merge(category, updateCategoryDto);
    return this.categoryRepository.save(updated);
  }

  async remove(id: number): Promise<{ message: string; id: number }> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'Categoria eliminada correctamente', id };
  }
}
