import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImage } from './product-image.entity';
import { Category } from '../category/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${dto.categoryId} not found.`,
      );
    }

    const existingProduct = await this.productRepository.findOne({
      where: { name: dto.name },
    });

    if (existingProduct) {
      throw new ConflictException('Product name already exists');
    }

    const product = this.productRepository.create({ ...dto, category });

    const savedProduct = await this.productRepository.save(product);

    if (dto.imageUrls?.length) {
      const images = dto.imageUrls.map((url) =>
        this.imageRepository.create({ url, product: savedProduct }),
      );
      await this.imageRepository.save(images);
      savedProduct.images = images;
    }

    return {
      message: 'Product created successfully',
      data: savedProduct,
    };
  }

  async findAll(locale: string = 'en') {
    const products = await this.productRepository.find({
      where: { isActive: true },
      relations: ['category', 'images'],
    });

    return {
      message: 'Product list fetched successfully',
      data: products.map((product) =>
        this.filterProductByLocale(product, locale),
      ),
    };
  }

  async findDeleted(locale: string = 'en') {
    const products = await this.productRepository.find({
      where: { isActive: false },
      relations: ['category', 'images'],
    });

    return {
      message: 'Deleted product fetched successfully',
      data: products.map((product) =>
        this.filterProductByLocale(product, locale),
      ),
    };
  }

  async findOne(id: number, locale: string = 'en') {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.update(product.id, {
      viewCount: () => '"viewCount" + 1',
    });

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images'],
    });

    return {
      message: 'Product fetched successfully',
      data: this.filterProductByLocale(updatedProduct as Product, locale),
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images', 'category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${dto.categoryId} not found.`,
        );
      }

      product.category = category;
    }

    const { imageUrls, ...otherFields } = dto;
    Object.assign(product, otherFields);

    if (imageUrls) {
      await this.imageRepository.delete({ product: { id } });

      const images = imageUrls.map((url) =>
        this.imageRepository.create({ url, product }),
      );
      await this.imageRepository.save(images);

      product.images = images;
    }

    const updated = await this.productRepository.save(product);
    return {
      message: 'Product updated successfully',
      data: updated,
    };
  }

  async softDelete(id: number) {
    const result = await this.productRepository.update(id, { isActive: false });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return { message: 'Product deleted successfully' };
  }

  async restore(id: number) {
    const result = await this.productRepository.update(id, { isActive: true });
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return { message: 'Product restored successfully' };
  }

  async hardDelete(id: number) {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return { message: 'Product permanently deleted successfully' };
  }

  async getFilteredProducts({
    sort = 'price_asc',
    page = 1,
    limit = 20,
  }: {
    sort: string;
    page: number;
    limit: number;
  }) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    switch (sort) {
      case 'price_asc':
        query.orderBy('product.totalPrice', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('product.totalPrice', 'DESC');
        break;
      case 'views_desc':
        query.orderBy('product.viewCount', 'DESC');
        break;
      default:
        query.orderBy('product.createdAt', 'DESC');
        break;
    }

    query.skip((page - 1) * limit).take(limit);

    return await query.getMany();
  }

  private filterProductByLocale(product: Product, locale: string) {
    return {
      ...product,
      name: (product.name?.[locale] as string) ?? null,
      origin: (product.origin?.[locale] as string) ?? null,
      material: (product.material?.[locale] as string) ?? null,
      description: (product.description?.[locale] as string) ?? null,
      specifications: (product.specifications?.[locale] as string) ?? null,
      category: {
        ...product.category,
        name: (product.category.name?.[locale] as string) ?? null,
        description: (product.category.description?.[locale] as string) ?? null,
      },
    };
  }
}
