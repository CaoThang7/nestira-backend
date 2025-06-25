import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Locale } from '../common/decorators/locale.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get('list')
  findAll(@Locale() locale: string) {
    return this.productService.findAll(locale);
  }

  @Get('list-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findDeleted(@Locale() locale: string) {
    return this.productService.findDeleted(locale);
  }

  @Get('list-sort')
  async getProducts(
    @Locale() locale: string,
    @Query('sort') sort: 'price_asc' | 'price_desc' | 'views_desc',
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<any[]> {
    return this.productService.getFilteredProducts({
      locale,
      sort,
      page,
      limit,
    });
  }

  @Get('kitchen-products')
  async getKitchenProducts(@Locale() locale: string): Promise<any[]> {
    return this.productService.getKitchenProducts(locale as 'vi' | 'en');
  }

  @Get('tech-products')
  async getTechProducts(@Locale() locale: string): Promise<any[]> {
    return this.productService.getTechProducts(locale as 'vi' | 'en');
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Locale() locale: string) {
    return this.productService.findOne(+id, locale);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(+id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  softDelete(@Param('id') id: string) {
    return this.productService.softDelete(+id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  restore(@Param('id') id: string) {
    return this.productService.restore(+id);
  }

  @Delete('hard-delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  hardDelete(@Param('id') id: string) {
    return this.productService.hardDelete(+id);
  }
}
