import {
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StoreCartItem } from './store-cart-item.entity';
import { round } from 'lodash';

@Entity()
export class StoreCart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => StoreCartItem, (i) => i.cart)
  items: StoreCartItem[];

  get itemCount() {
    let count = 0;

    this.items?.forEach(({ quantity }) => (count += quantity));

    return count;
  }

  get freeItemCount() {
    return Math.floor(this.itemCount / 3);
  }

  get totalPrice(): number {
    const itemPrices: number[] = [];

    this.items
      ?.sort((a, b) => a.item.price - b.item.price)
      .forEach((cartItem) => {
        itemPrices.push(
          ...new Array(cartItem.quantity).fill(cartItem.item.price),
        );
      });

    const totalPrice = itemPrices
      .slice(this.freeItemCount)
      .reduce((acc, i) => i + acc, 0);

    return round(totalPrice, 2);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
