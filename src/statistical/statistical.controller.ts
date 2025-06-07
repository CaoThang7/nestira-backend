import { StatisticalService } from './statistical.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

@Controller('statistical')
export class StatisticalController {
  constructor(private readonly statisticalService: StatisticalService) {}

  @Get('analytics/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getOverviewStats() {
    return this.statisticalService.getStatsOverview();
  }

  @Get('analytics/monthly/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getMonthlyStats(@Param('year') year: number) {
    return this.statisticalService.getMonthlyStats(year);
  }

  @Get('analytics/yearly/:year')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getYearlyStats(@Param('year') year: number) {
    return this.statisticalService.getYearlyStats(year);
  }

  @Get('analytics/top-selling-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getTopSellingProducts() {
    return this.statisticalService.getTopSellingProducts();
  }
}
