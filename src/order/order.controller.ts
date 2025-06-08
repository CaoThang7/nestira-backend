import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus } from './order.entity';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/delete-order.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.orderService.getAllOrders(page, limit);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOrdersByStatus(@Param('status') status: OrderStatus) {
    return await this.orderService.getOrdersByStatus(status);
  }

  @Get(':orderCode')
  async getOrder(@Param('orderCode') orderCode: string) {
    return await this.orderService.findOrderByCode(orderCode);
  }

  @Patch('status/:orderCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateOrderStatus(
    @Param('orderCode') orderCode: string,
    @Body('status') status: OrderStatus,
  ) {
    const result = await this.orderService.updateOrderStatus(orderCode, status);
    return {
      message: result.message,
      success: true,
      data: result.order,
    };
  }

  // Delete order by ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteOrder(@Param('id') id: number) {
    await this.orderService.deleteOrder(id);
    return {
      message: 'Order deleted successfully',
      success: true,
    };
  }

  // Delete order by order code
  @Delete('code/:orderCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteOrderByCode(@Param('orderCode') orderCode: string) {
    await this.orderService.deleteOrderByCode(orderCode);
    return {
      message: 'Order deleted successfully',
      success: true,
    };
  }

  // Cancel order (soft delete)
  @Put('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async cancelOrder(@Body() cancelOrderDto: CancelOrderDto) {
    const order = await this.orderService.cancelOrder(cancelOrderDto.orderCode);
    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}
