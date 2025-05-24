import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Locale } from '../common/decorators/locale.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Locale() locale: string) {
    return this.categoryService.findAll(locale);
  }

  @Get('list-delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findDeleted(@Locale() locale: string) {
    return this.categoryService.findDeleted(locale);
  }

  @Get('detail/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string, @Locale() locale: string) {
    return this.categoryService.findOne(+id, locale);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(+id, dto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  softDelete(@Param('id') id: string) {
    return this.categoryService.softDelete(+id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  restore(@Param('id') id: string) {
    return this.categoryService.restore(+id);
  }

  @Delete('hard-delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  hardDelete(@Param('id') id: string) {
    return this.categoryService.hardDelete(+id);
  }
}
