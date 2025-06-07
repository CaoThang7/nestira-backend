import { Module } from '@nestjs/common';
import { User } from './user/user.entity';
import { AppService } from './app.service';
import { Order } from './order/order.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { OrderModule } from './order/order.module';
import { Product } from './product/product.entity';
import { EmailModule } from './email/email.module';
import { OrderItem } from './order/order-item.entity';
import { SearchModule } from './search/search.module';
import { Category } from './category/category.entity';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ProductImage } from './product/product-image.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres' | 'mysql' | 'mariadb' | 'sqlite',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Product, ProductImage, Category, User, Order, OrderItem],
      synchronize: true,
    }),
    ProductModule,
    CategoryModule,
    UserModule,
    AuthModule,
    SearchModule,
    OrderModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
