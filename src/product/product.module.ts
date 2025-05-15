import { Module } from '@nestjs/common';
import { Product } from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductImage } from './product-image.entity';
import { Category } from '../category/category.entity';
import { ProductController } from './product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category])],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
