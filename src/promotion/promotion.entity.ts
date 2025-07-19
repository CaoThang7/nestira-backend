import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('jsonb')
  title: {
    vi: string;
    en: string;
  };

  @Column('jsonb', { nullable: true })
  content?: {
    vi?: any;
    en?: any;
  };

  @Column({ nullable: true })
  thumbnail?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
