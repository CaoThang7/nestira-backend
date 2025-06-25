import { Product } from './product.entity';
import { Repository, Brackets } from 'typeorm';
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

    if (!updatedProduct) {
      throw new NotFoundException(`Not found`);
    }

    updatedProduct.images.sort((a, b) => a.id - b.id);

    return {
      message: 'Product fetched successfully',
      data: this.filterProductByLocale(updatedProduct, locale),
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
    locale = 'en',
    sort = 'price_asc',
  }: {
    locale: string;
    sort: string;
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

    query.addOrderBy('image.id', 'ASC');

    const rawProducts = await query.getMany();

    return rawProducts.map((product) =>
      this.filterProductByLocale(product, locale),
    );
  }

  //Function get Kitchen Products
  async getKitchenProducts(locale: 'vi' | 'en' = 'vi'): Promise<any[]> {
    const kitchenKeywords = {
      en: [
        'induction cooker',
        'range hood',
        'dishwasher',
        'griller',
        'refrigerator',
        'coffee machine',
        'kitchen faucet',
        'kitchen sink',
      ],
      vi: [
        'bếp từ',
        'máy hút mùi',
        'máy rửa bát',
        'lò nướng',
        'tủ lạnh',
        'máy pha cà phê',
        'vòi bếp',
        'chậu rửa bếp',
      ],
    };

    const keywords = kitchenKeywords[locale];

    // Get all matching products first
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Search for category name or product name
    if (keywords.length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          keywords.forEach((keyword, index) => {
            const categoryParamKey = `categoryKeyword${index}`;
            const productParamKey = `productKeyword${index}`;

            if (index === 0) {
              qb.where(
                `(LOWER(category.name ->> :locale) LIKE :${categoryParamKey} OR LOWER(product.name ->> :locale) LIKE :${productParamKey})`,
                {
                  locale,
                  [categoryParamKey]: `%${keyword.toLowerCase()}%`,
                  [productParamKey]: `%${keyword.toLowerCase()}%`,
                },
              );
            } else {
              qb.orWhere(
                `(LOWER(category.name ->> :locale) LIKE :${categoryParamKey} OR LOWER(product.name ->> :locale) LIKE :${productParamKey})`,
                {
                  locale,
                  [categoryParamKey]: `%${keyword.toLowerCase()}%`,
                  [productParamKey]: `%${keyword.toLowerCase()}%`,
                },
              );
            }
          });
        }),
      );
    }

    query.orderBy('product.createdAt', 'DESC');
    query.addOrderBy('image.id', 'ASC');
    const allProducts = await query.getMany();

    // Filter to get diverse products (max 1 per category, prioritize different types)
    const selectedProducts: Product[] = [];
    const usedCategories = new Set<number>();
    const priorityKeywords = [
      'kitchen sink',
      'kitchen faucet',
      'chậu rửa bếp',
      'vòi bếp',
    ];

    // First pass: prioritize kitchen sink and kitchen faucet
    for (const product of allProducts) {
      if (selectedProducts.length >= 4) break;

      const categoryName =
        product.category?.name?.[locale]?.toLowerCase() || '';
      const productName = product.name?.[locale]?.toLowerCase() || '';

      // Check if this product matches priority keywords
      const matchesPriority = priorityKeywords.some(
        (keyword) =>
          categoryName.includes(keyword.toLowerCase()) ||
          productName.includes(keyword.toLowerCase()),
      );

      if (matchesPriority && !usedCategories.has(product.category?.id)) {
        selectedProducts.push(product);
        usedCategories.add(product.category?.id);
      }
    }

    // Second pass: fill remaining slots with other diverse products
    for (const product of allProducts) {
      if (selectedProducts.length >= 4) break;

      // Skip if already selected or category already used
      if (
        selectedProducts.includes(product) ||
        usedCategories.has(product.category?.id)
      ) {
        continue;
      }

      selectedProducts.push(product);
      usedCategories.add(product.category?.id);
    }

    // If still need more products and have exhausted unique categories, fill with remaining
    if (selectedProducts.length < 4) {
      for (const product of allProducts) {
        if (selectedProducts.length >= 4) break;

        if (!selectedProducts.includes(product)) {
          selectedProducts.push(product);
        }
      }
    }

    return selectedProducts.map((product) =>
      this.filterProductByLocale(product, locale),
    );
  }

  //Function get Tech Products
  async getTechProducts(locale: 'vi' | 'en' = 'vi'): Promise<any[]> {
    const techKeywords = {
      en: [
        'robot floor cleaner',
        'air purifier',
        'dryer',
        'smart washing machine',
        'smart home',
      ],
      vi: [
        'robot lau nhà',
        'máy lọc không khí',
        'máy sấy quần áo',
        'máy giặt thông minh',
        'nhà thông minh',
      ],
    };

    const keywords = techKeywords[locale];

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Search for category name or product name
    if (keywords.length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          keywords.forEach((keyword, index) => {
            const categoryParamKey = `categoryKeyword${index}`;
            const productParamKey = `productKeyword${index}`;

            if (index === 0) {
              qb.where(
                `(LOWER(category.name ->> :locale) LIKE :${categoryParamKey} OR LOWER(product.name ->> :locale) LIKE :${productParamKey})`,
                {
                  locale,
                  [categoryParamKey]: `%${keyword.toLowerCase()}%`,
                  [productParamKey]: `%${keyword.toLowerCase()}%`,
                },
              );
            } else {
              qb.orWhere(
                `(LOWER(category.name ->> :locale) LIKE :${categoryParamKey} OR LOWER(product.name ->> :locale) LIKE :${productParamKey})`,
                {
                  locale,
                  [categoryParamKey]: `%${keyword.toLowerCase()}%`,
                  [productParamKey]: `%${keyword.toLowerCase()}%`,
                },
              );
            }
          });
        }),
      );
    }

    query.orderBy('product.createdAt', 'DESC').take(4);
    query.addOrderBy('image.id', 'ASC');
    const rawProducts = await query.getMany();

    return rawProducts.map((product) =>
      this.filterProductByLocale(product, locale),
    );
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
