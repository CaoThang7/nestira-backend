import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderCode: string; // Auto generate order code

  // Customer information
  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  customerEmail: string;

  // Shipping address
  @Column()
  shippingAddress: string;

  @Column()
  ward: string; // Ward

  @Column()
  district: string; // District/County

  @Column()
  city: string; // City/Province

  @Column('text', { nullable: true })
  notes?: string; // Order notes

  // Payment information
  @Column('decimal', { precision: 12, scale: 0 })
  totalAmount: number; // Total payment amount

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
