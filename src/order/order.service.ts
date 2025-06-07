import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './order.entity';
import { Product } from '../product/product.entity';
import { EmailService } from 'src/email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly emailService: EmailService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // 1. Validate and get product information
    const products = await this.validateAndGetProducts(createOrderDto.items);

    // 2. Create and save order before (no items)
    const order = this.orderRepository.create({
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      customerEmail: createOrderDto.customerEmail,
      shippingAddress: createOrderDto.shippingAddress,
      ward: createOrderDto.ward,
      district: createOrderDto.district,
      city: createOrderDto.city,
      notes: createOrderDto.notes,
      orderCode: this.generateOrderCode(),
      totalAmount: 0,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // 3. Create order items
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const itemDto of createOrderDto.items) {
      const product = products.find((p) => p.id === itemDto.productId);
      if (!product) {
        throw new BadRequestException(
          `Product with ID ${itemDto.productId} not found`,
        );
      }

      const unitPrice = Number(product?.totalPrice);
      const totalPrice = unitPrice * itemDto.quantity;

      const orderItem = this.orderItemRepository.create({
        quantity: itemDto.quantity,
        unitPrice,
        totalPrice,
        productSnapshot: {
          id: product.id,
          name: product.name,
          brand: product.brand,
          productCode: product.productCode,
          color: product.color,
          size: product.size,
          images: product.images?.map((img) => img.url) || [],
        },
        product,
        order: savedOrder, // Use the saved order
      });

      const savedOrderItem = await this.orderItemRepository.save(orderItem);
      orderItems.push(savedOrderItem);
      totalAmount += totalPrice;
    }

    // 4. Update total amount for order
    savedOrder.totalAmount = totalAmount;
    const finalOrder = await this.orderRepository.save(savedOrder);

    // 5. Load order with relationships
    const orderWithRelations = await this.orderRepository.findOne({
      where: { id: finalOrder.id },
      relations: ['items', 'items.product'],
    });

    if (!orderWithRelations) {
      throw new NotFoundException('Order not found after creation');
    }

    // Send order confirmation email
    await this.emailService.sendOrderConfirmation(orderWithRelations);

    // Send new order notification email to admin
    await this.emailService.sendNewOrderNotificationToAdmin(orderWithRelations);

    return orderWithRelations;
  }

  // Alternative approach using transaction (recommended)
  async createOrderWithTransaction(
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return await this.orderRepository.manager.transaction(async (manager) => {
      // 1. Validate products
      const productIds = createOrderDto.items.map((item) => item.productId);
      const products = await manager.find(Product, {
        relations: ['images'],
        where: { isActive: true, id: In(productIds) },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'Some products do not exist or are no longer available',
        );
      }

      // 2. Create and save order
      const order = manager.create(Order, {
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        customerEmail: createOrderDto.customerEmail,
        shippingAddress: createOrderDto.shippingAddress,
        ward: createOrderDto.ward,
        district: createOrderDto.district,
        city: createOrderDto.city,
        notes: createOrderDto.notes,
        orderCode: this.generateOrderCode(),
        totalAmount: 0,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await manager.save(Order, order);

      // 3. Create order items
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        const product = products.find((p) => p.id === itemDto.productId);
        if (!product) {
          throw new BadRequestException(
            `Product with ID ${itemDto.productId} not found`,
          );
        }

        const unitPrice = Number(product.price);
        const totalPrice = unitPrice * itemDto.quantity;

        const orderItem = manager.create(OrderItem, {
          quantity: itemDto.quantity,
          unitPrice,
          totalPrice,
          productSnapshot: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            productCode: product.productCode,
            color: product.color,
            size: product.size,
            images: product.images?.map((img) => img.url) || [],
          },
          product,
          order: savedOrder,
        });

        const savedOrderItem = await manager.save(OrderItem, orderItem);
        orderItems.push(savedOrderItem);
        totalAmount += totalPrice;
      }

      // 4. Update order total amount
      savedOrder.totalAmount = totalAmount;
      await manager.save(Order, savedOrder);

      // 5. Return order with relations
      const orderWithRelations = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['items', 'items.product'],
      });

      if (!orderWithRelations) {
        throw new NotFoundException('Order not found after creation');
      }

      return orderWithRelations;
    });
  }

  private async validateAndGetProducts(
    items: { productId: number; quantity: number }[],
  ): Promise<Product[]> {
    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.find({
      relations: ['images'],
      where: { isActive: true, id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException(
        'Some products do not exist or are no longer available',
      );
    }

    return products;
  }

  private generateOrderCode(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp.slice(-6)}${random}`;
  }

  async findOrderByCode(orderCode: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderCode },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    orderCode: string,
    status: OrderStatus,
  ): Promise<{ order: Order; message: string }> {
    const order = await this.findOrderByCode(orderCode);
    const oldStatus = order.status;
    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);

    // Generate appropriate message based on status
    let message = '';
    switch (status) {
      case OrderStatus.CONFIRMED:
        message = 'Order has been confirmed successfully';
        break;
      case OrderStatus.PROCESSING:
        message = 'Order is being processed';
        break;
      case OrderStatus.SHIPPING:
        message = 'Order is being shipped';
        break;
      case OrderStatus.DELIVERED:
        message = 'Order has been delivered successfully';
        break;
      case OrderStatus.CANCELLED:
        message = 'Order has been cancelled';
        break;
      case OrderStatus.PENDING:
        message = 'Order has been transferred to pending status';
        break;
      default:
        message = 'Update order status successfully';
    }

    // Send corresponding email
    try {
      switch (status) {
        case OrderStatus.CONFIRMED:
          await this.emailService.sendOrderApproved(updatedOrder);
          break;
        case OrderStatus.SHIPPING:
          await this.emailService.sendOrderShipping(updatedOrder);
          break;
        case OrderStatus.DELIVERED:
          await this.emailService.sendOrderDelivered(updatedOrder);
          break;
        case OrderStatus.CANCELLED:
          await this.emailService.sendOrderCancelled(updatedOrder);
          break;
      }
    } catch (err) {
      console.error('Error sending email when updating order:', err);
    }

    return {
      order: updatedOrder,
      message: `${message} (from ${oldStatus} → ${status})`,
    };
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ orders: Order[]; total: number }> {
    const [orders, total] = await this.orderRepository.findAndCount({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { orders, total };
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { status },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  // Delete order by ID
  async deleteOrder(orderId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Not found order');
    }

    // Check if order can be deleted (only pending or cancelled orders)
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only pending or cancelled orders can be deleted',
      );
    }

    // Use transaction to ensure proper deletion order
    await this.orderRepository.manager.transaction(async (manager) => {
      // Delete order items first
      if (order.items && order.items.length > 0) {
        await manager.remove(OrderItem, order.items);
      }

      // Then delete the order
      await manager.remove(Order, order);
    });
  }

  // Delete order by order code
  async deleteOrderByCode(orderCode: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { orderCode },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Not found order');
    }

    // Check if order can be deleted
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Only pending or cancelled orders can be deleted',
      );
    }

    // Use transaction to ensure proper deletion order
    await this.orderRepository.manager.transaction(async (manager) => {
      // Delete order items first
      if (order.items && order.items.length > 0) {
        await manager.remove(OrderItem, order.items);
      }

      // Then delete the order
      await manager.remove(Order, order);
    });
  }

  // Soft delete (cancel order instead of hard delete)
  async cancelOrder(orderCode: string): Promise<Order> {
    const order = await this.findOrderByCode(orderCode);

    // Check if order can be cancelled
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(
        'Cannot cancel order that has been delivered',
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order has been cancelled before');
    }

    order.status = OrderStatus.CANCELLED;
    return await this.orderRepository.save(order);
  }
}
