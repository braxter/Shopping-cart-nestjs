import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { StoreCart } from '../database/entities/store-cart.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreItem } from '../database/entities/store-item.entity';
import { StoreCartItem } from '../database/entities/store-cart-item.entity';

@Injectable()
export class StoreCartItemService {
  constructor(@InjectEntityManager() private entityManager: EntityManager) {}

  async updateStoreCartItemQuantity(
    cartId: number,
    itemId: number,
    quantityDiff: number,
  ) {
    return await this.entityManager.transaction(async (entityManager) => {
      const cart = await entityManager.findOne(StoreCart, {
        where: { id: cartId },
        relations: {
          items: { item: true },
        },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = await entityManager.findOne(StoreItem, {
        where: { id: itemId },
      });

      if (!item) {
        throw new NotFoundException('Item not found');
      }

      let cartItem = cart.items.find((i) => i.item.id == item.id);

      if (!cartItem) {
        cartItem = new StoreCartItem();
        cartItem.cart = cart;
        cartItem.item = item;
        cartItem.quantity = 0;

        cart.items.push(cartItem);
      }

      cartItem.quantity = cartItem.quantity + quantityDiff;

      if (cartItem.quantity > 0) {
        await entityManager.save(cartItem);
      } else {
        await entityManager.remove(cartItem);
        cart.items = cart.items.filter((ci) => ci.item.id !== item.id);
      }

      return cart;
    });
  }
}
