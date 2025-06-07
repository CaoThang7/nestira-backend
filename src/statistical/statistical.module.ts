import { Module } from '@nestjs/common';
import { Order } from 'src/order/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/product.entity';
import { OrderItem } from 'src/order/order-item.entity';
import { StatisticalService } from './statistical.service';
import { StatisticalController } from './statistical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [StatisticalController],
  providers: [StatisticalService],
  exports: [StatisticalService],
})
export class StatisticalModule {}
