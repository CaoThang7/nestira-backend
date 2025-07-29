import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { NewslettersService } from './newsletters.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateNewslettersDto } from './dto/create-newsletters.dto';
import { Locale } from 'src/common/decorators/locale.decorator';

@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Body() dto: CreateNewslettersDto) {
    return this.newslettersService.create(dto);
  }

  @Post('send/:subscriberId/promotion/:promotionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendToSubscriber(
    @Param('subscriberId', ParseIntPipe) subscriberId: number,
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Locale() locale: string,
  ) {
    return this.newslettersService.sendToSubscriber(
      subscriberId,
      promotionId,
      locale,
    );
  }

  @Post('send-all/promotion/:promotionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async sendToAllSubscribers(
    @Param('promotionId', ParseIntPipe) promotionId: number,
    @Locale() locale: string,
  ) {
    return this.newslettersService.sendToAllSubscribers(promotionId, locale);
  }

  @Get('get-all-subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllSubscribers() {
    return this.newslettersService.getAllSubscribers();
  }

  @Delete(':subscriberId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async deleteSubscriber(
    @Param('subscriberId', ParseIntPipe) subscriberId: number,
  ) {
    return this.newslettersService.deleteSubscriber(subscriberId);
  }
}
