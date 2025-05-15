import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Locale } from 'src/common/decorators/locale.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get('list')
  findAll(@Locale() locale: string) {
    return this.categoryService.findAll(locale);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Locale() locale: string) {
    return this.categoryService.findOne(+id, locale);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(+id, dto);
  }

  @Delete('delete/:id')
  softDelete(@Param('id') id: string) {
    return this.categoryService.softDelete(+id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.categoryService.restore(+id);
  }

  @Delete('hard-delete/:id')
  hardDelete(@Param('id') id: string) {
    return this.categoryService.hardDelete(+id);
  }
}
