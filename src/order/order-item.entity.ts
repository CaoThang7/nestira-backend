import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../product/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 12, scale: 0 })
  unitPrice: number; // Price at the time of order

  @Column('decimal', { precision: 12, scale: 0 })
  totalPrice: number; // quantity * unitPrice

  // Save product information at the time of order
  @Column('jsonb')
  productSnapshot: {
    id: number;
    name: {
      vi: string;
      en: string;
    };
    brand?: string;
    productCode?: string;
    color?: string;
    size?: string;
    images?: string[];
  };

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;
}
