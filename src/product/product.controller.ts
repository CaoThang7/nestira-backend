import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Locale() locale: string) {
    return this.productService.findAll(locale);
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
