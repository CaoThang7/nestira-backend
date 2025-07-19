import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Locale } from 'src/common/decorators/locale.decorator';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(+id, dto);
  }

  @Get('list')
  findAll(@Locale() locale: string) {
    return this.promotionService.findAll(locale);
  }

  @Get('list-latest')
  findLatest(@Locale() locale: string) {
    return this.promotionService.findLatest(locale);
  }

  @Get('detail/:id')
  findOne(@Param('id') id: string, @Locale() locale: string) {
    return this.promotionService.findOne(+id, locale);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  hardDelete(@Param('id') id: string) {
    return this.promotionService.remove(+id);
  }
}
