import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { StoreCart } from './store-cart.entity';
import { StoreItem } from './store-item.entity';

@Entity()
@Unique(['cart', 'item'])
export class StoreCartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StoreCart, (cart) => cart.items)
  cart: StoreCart;

  @ManyToOne(() => StoreItem)
  item: StoreItem;

  @Column('numeric')
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
