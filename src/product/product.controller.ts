import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Locale } from '../common/decorators/locale.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('create')
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get('list')
  findAll(@Locale() locale: string) {
    return this.productService.findAll(locale);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Locale() locale: string) {
    return this.productService.findOne(+id, locale);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(+id, dto);
  }

  @Delete('delete/:id')
  softDelete(@Param('id') id: string) {
    return this.productService.softDelete(+id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.productService.restore(+id);
  }

  @Delete('hard-delete/:id')
  hardDelete(@Param('id') id: string) {
    return this.productService.hardDelete(+id);
  }
}
