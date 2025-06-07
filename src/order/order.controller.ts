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
} from '@nestjs/common';
import { OrderStatus } from './order.entity';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/delete-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('create')
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get('all')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.orderService.getAllOrders(page, limit);
  }

  @Get('status/:status')
  async getOrdersByStatus(@Param('status') status: OrderStatus) {
    return await this.orderService.getOrdersByStatus(status);
  }

  @Get(':orderCode')
  async getOrder(@Param('orderCode') orderCode: string) {
    return await this.orderService.findOrderByCode(orderCode);
  }

  @Patch('status/:orderCode')
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
  async deleteOrder(@Param('id') id: number) {
    await this.orderService.deleteOrder(id);
    return {
      message: 'Order deleted successfully',
      success: true,
    };
  }

  // Delete order by order code
  @Delete('code/:orderCode')
  async deleteOrderByCode(@Param('orderCode') orderCode: string) {
    await this.orderService.deleteOrderByCode(orderCode);
    return {
      message: 'Order deleted successfully',
      success: true,
    };
  }

  // Cancel order (soft delete)
  @Put('cancel')
  async cancelOrder(@Body() cancelOrderDto: CancelOrderDto) {
    const order = await this.orderService.cancelOrder(cancelOrderDto.orderCode);
    return {
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}
