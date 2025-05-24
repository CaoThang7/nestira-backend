import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepository.create(dto);
    try {
      await this.categoryRepository.save(category);
      return { message: 'Category created successfully' };
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Category name already exists');
      }
      throw error;
    }
  }

  async findAll(locale: string = 'en') {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
    });

    const data = categories.map((cat) => ({
      id: cat.id,
      name: cat.name?.[locale] || '',
      description: cat.description?.[locale] || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return { message: 'Categories fetched successfully', data };
  }

  async findDeleted(locale: string = 'en') {
    const categories = await this.categoryRepository.find({
      where: { isActive: false },
    });
  
    const data = categories.map((cat) => ({
      id: cat.id,
      name: cat.name?.[locale] || '',
      description: cat.description?.[locale] || '',
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));
  
    return { message: 'Deleted categories fetched successfully', data };
  }

  async findOne(id: number, locale: string = 'en') {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }

    return {
      message: 'Category fetched successfully',
      data: {
        id: category.id,
        name: category.name?.[locale] || '',
        description: category.description?.[locale] || '',
      },
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category ID ${id} not found`);

    category.name = { ...category.name, ...dto.name };
    category.description = { ...category.description, ...dto.description };

    await this.categoryRepository.save(category);

    return { message: 'Category updated successfully' };
  }

  async softDelete(id: number) {
    const result = await this.categoryRepository.update(id, {
      isActive: false,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return { message: 'Category deleted successfully' };
  }

  async restore(id: number) {
    const result = await this.categoryRepository.update(id, { isActive: true });
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return { message: 'Category restored successfully' };
  }

  async hardDelete(id: number) {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return { message: 'Category permanently deleted successfully' };
  }
}
