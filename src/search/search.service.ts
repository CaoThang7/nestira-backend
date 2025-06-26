// search.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/category.entity';
import { Product } from '../product/product.entity';

export interface CategorySuggestion {
  id: number;
  name: { en?: string; vi?: string };
}

export interface ProductSearchResult {
  id: number;
  name: { vi: string; en: string };
  brand?: string;
  productCode?: string;
  price: number;
  totalPrice?: number;
  color?: string;
  origin?: { vi?: string; en?: string };
  material?: { vi?: string; en?: string };
  size?: string;
  description?: { vi?: any; en?: any };
  specifications?: { vi?: any; en?: any };
  category: {
    id: number;
    name: { en?: string; vi?: string };
  };
  images: any[];
}

export interface SearchSuggestionResponse {
  categories: CategorySuggestion[];
}

export interface ProductSearchResponse {
  products: ProductSearchResult[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Get category suggestions when user clicks on search input
  async getCategorySuggestions(
    query?: string,
  ): Promise<SearchSuggestionResponse> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .where('category.isActive = :isActive', { isActive: true })
      .orderBy('category.name', 'ASC');

    // If there is a query, filter by category name
    if (query && query.trim()) {
      queryBuilder.andWhere(
        "(category.name->>'vi' ILIKE :query OR category.name->>'en' ILIKE :query)",
        { query: `%${query.trim()}%` },
      );
    }

    const categories = await queryBuilder.getMany();

    return {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
      })),
    };
  }

  // Search products by keyword (name or productCode)
  async searchProducts(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductSearchResponse> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('category.isActive = :categoryActive', {
        categoryActive: true,
      });

    // Search by name (vi, en) or productCode
    const trimmedQuery = query?.trim();
    if (trimmedQuery && trimmedQuery.length > 0) {
      queryBuilder.andWhere(
        "(product.name->>'vi' ILIKE :query OR product.name->>'en' ILIKE :query OR product.productCode ILIKE :query)",
        { query: `%${trimmedQuery}%` },
      );
    } else {
      return {
        products: [],
        total: 0,
        page,
        limit,
      };
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by relevance (can customize)
    queryBuilder.orderBy('product.createdAt', 'DESC');
    queryBuilder.addOrderBy('images.id', 'ASC');

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        totalPrice: product.totalPrice,
        brand: product.brand,
        productCode: product.productCode,
        color: product.color,
        size: product.size,
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        images: product.images,
      })),
      total,
      page,
      limit,
    };
  }

  // Get products by category ID
  async getProductsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<ProductSearchResponse> {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('category.isActive = :categoryActive', { categoryActive: true })
      .andWhere('category.id = :categoryId', { categoryId });

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    queryBuilder.orderBy('product.createdAt', 'DESC');
    queryBuilder.addOrderBy('images.id', 'ASC');

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        productCode: product.productCode,
        price: product.price,
        totalPrice: product.totalPrice,
        color: product.color,
        origin: product.origin,
        material: product.material,
        size: product.size,
        description: product.description,
        specifications: product.specifications,
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        images: product.images,
      })),
      total,
      page,
      limit,
    };
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: {
    query?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    color?: string;
    size?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductSearchResponse> {
    const {
      query,
      categoryId,
      minPrice,
      maxPrice,
      brand,
      color,
      size,
      page = 1,
      limit = 20,
    } = filters;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('category.isActive = :categoryActive', {
        categoryActive: true,
      });

    // Text search
    if (query && query.trim()) {
      queryBuilder.andWhere(
        "(product.name->>'vi' ILIKE :query OR product.name->>'en' ILIKE :query OR product.productCode ILIKE :query)",
        { query: `%${query.trim()}%` },
      );
    }

    // Category filter
    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    // Price range filter
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Other filters
    if (brand) {
      queryBuilder.andWhere('product.brand ILIKE :brand', {
        brand: `%${brand}%`,
      });
    }
    if (color) {
      queryBuilder.andWhere('product.color ILIKE :color', {
        color: `%${color}%`,
      });
    }
    if (size) {
      queryBuilder.andWhere('product.size ILIKE :size', { size: `%${size}%` });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    queryBuilder.orderBy('product.createdAt', 'DESC');

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        productCode: product.productCode,
        price: product.price,
        totalPrice: product.totalPrice,
        color: product.color,
        origin: product.origin,
        material: product.material,
        size: product.size,
        description: product.description,
        specifications: product.specifications,
        category: {
          id: product.category.id,
          name: product.category.name,
        },
        images: product.images,
      })),
      total,
      page,
      limit,
    };
  }
}
