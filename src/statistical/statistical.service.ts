import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from 'src/order/order-item.entity';
import { Order, OrderStatus } from 'src/order/order.entity';

type MonthlyRawRow = {
  month: string;
  totalOrders: string;
  totalIncome: string;
};

@Injectable()
export class StatisticalService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getStatsOverview(): Promise<{
    totalOrders: number;
    totalIncome: number;
    totalCancelled: number;
    totalDelivered: number;
  }> {
    const [totalOrders, totalDelivered, totalCancelled, totalIncome] =
      await Promise.all([
        this.orderRepository.count(),
        this.orderRepository.count({
          where: { status: OrderStatus.DELIVERED },
        }),
        this.orderRepository.count({
          where: { status: OrderStatus.CANCELLED },
        }),
        this.orderRepository
          .createQueryBuilder('order')
          .select('SUM(order.totalAmount)', 'sum')
          .where('order.status = :status', { status: OrderStatus.DELIVERED })
          .getRawOne()
          .then((res: { sum: string }) => Number(res.sum) || 0),
      ]);

    return {
      totalOrders,
      totalDelivered,
      totalCancelled,
      totalIncome,
    };
  }

  async getMonthlyStats(year: number) {
    const rawData = await this.orderRepository
      .createQueryBuilder('o')
      .select([
        `EXTRACT(MONTH FROM o."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') AS month`,
        `COUNT(*) AS "totalOrders"`,
        `SUM(CASE WHEN o.status = 'delivered' THEN o."totalAmount" ELSE 0 END) AS "totalIncome"`,
      ])
      .where(
        `EXTRACT(YEAR FROM o."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') = :year`,
        { year },
      )
      .groupBy('month')
      .orderBy('month')
      .getRawMany<MonthlyRawRow>();

    const fullData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const found = rawData.find(
        (row: { month: string }) => Number(row.month) === month,
      );
      return {
        month,
        totalOrders: Number(found?.totalOrders || 0),
        totalIncome: Number(found?.totalIncome || 0),
      };
    });

    const withGrowth = fullData.map((cur, index, arr) => {
      if (index === 0) return { ...cur, growthRate: 0 };
      const prev = arr[index - 1].totalIncome || 0;
      const growthRate =
        prev === 0
          ? cur.totalIncome > 0
            ? 100
            : 0
          : ((cur.totalIncome - prev) / prev) * 100;
      return { ...cur, growthRate: +growthRate.toFixed(2) };
    });

    return withGrowth;
  }

  async getYearlyStats(year: number) {
    const result = await this.orderRepository
      .createQueryBuilder('o')
      .select([
        `COUNT(*) AS "totalOrders"`,
        `SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS "deliveredOrders"`,
        `SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS "cancelledOrders"`,
        `SUM(CASE WHEN o.status = 'delivered' THEN o.totalAmount ELSE 0 END) AS "totalIncome"`,
      ])
      .where(
        `EXTRACT(YEAR FROM o.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') = :year`,
        { year },
      )
      .getRawOne<{
        totalOrders: string;
        deliveredOrders: string;
        cancelledOrders: string;
        totalIncome: string;
      }>();

    const totalOrders = Number(result?.totalOrders || 0);
    const deliveredOrders = Number(result?.deliveredOrders || 0);
    const cancelledOrders = Number(result?.cancelledOrders || 0);
    const totalIncome = Number(result?.totalIncome || 0);

    const deliveryRate =
      totalOrders === 0
        ? 0
        : Number(((deliveredOrders / totalOrders) * 100).toFixed(2));

    return {
      year,
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      totalIncome,
      deliveryRate,
    };
  }

  async getTopSellingProducts(limit: number = 5) {
    // First, get the top selling products without images to avoid duplication
    const topProducts = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();

    // If no products found, return empty array
    if (topProducts.length === 0) {
      return [];
    }

    // Get product IDs for image lookup
    const productIds = topProducts.map((p: { productId: string }) =>
      Number(p.productId),
    );

    // Get images for these products separately
    const productImages = await this.orderItemRepository
      .createQueryBuilder('item')
      .innerJoin('item.product', 'product')
      .leftJoin('product.images', 'image')
      .select('product.id', 'productId')
      .addSelect(
        "COALESCE(json_agg(DISTINCT image.url) FILTER (WHERE image.url IS NOT NULL), '[]'::json)",
        'images',
      )
      .where('product.id IN (:...productIds)', { productIds })
      .groupBy('product.id')
      .getRawMany();

    // Create a map for quick image lookup
    const imageMap = new Map(
      productImages.map((img: { productId: string; images: string }) => [
        Number(img.productId),
        img.images,
      ]),
    );

    const results = topProducts.map(
      (product: {
        productId: string;
        productName: string;
        totalSold: string;
        totalRevenue: string;
        images: string | string[];
      }) => ({
        ...product,
        images: imageMap.get(Number(product.productId)) || '[]',
      }),
    );

    return results.map(
      (r: {
        productId: string;
        productName: string;
        totalSold: string;
        totalRevenue: string;
        images: string | string[];
      }) => ({
        productId: Number(r.productId),
        productName: r.productName,
        productImages: Array.isArray(r.images)
          ? r.images
          : (JSON.parse(r.images || '[]') as string[]),
        totalSold: Number(r.totalSold),
        totalRevenue: Number(r.totalRevenue),
      }),
    );
  }
}
