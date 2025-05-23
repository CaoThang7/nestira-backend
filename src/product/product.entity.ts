import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  name: {
    vi: string;
    en: string;
  };

  @Column('jsonb', { nullable: true })
  description?: {
    vi?: any;
    en?: any;
  };

  @Column('decimal')
  price: number;

  @Column('decimal', { nullable: true })
  totalPrice?: number;

  @Column({ nullable: true })
  brand?: string;

  @Column({ nullable: true })
  productCode?: string;

  @Column({ nullable: true })
  color?: string;

  @Column('jsonb', { nullable: true })
  origin?: {
    vi?: string;
    en?: string;
  };

  @Column('jsonb', { nullable: true })
  material?: {
    vi?: string;
    en?: string;
  };

  @Column({ nullable: true })
  size?: string;

  @Column('jsonb', { nullable: true })
  specifications?: {
    vi?: any;
    en?: any;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];
}
