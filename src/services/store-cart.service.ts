import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreCart } from '../database/entities/store-cart.entity';
import { StoreCartItemService } from './store-cart-item.service';

@Injectable()
export class StoreCartService {
  constructor(
    @InjectRepository(StoreCart) private repo: Repository<StoreCart>,
    private storeCartItemService: StoreCartItemService,
  ) {}

  async createCart() {
    const cart = this.repo.create();

    cart.items = [];

    return this.repo.save(cart);
  }

  async getCart(id: number) {
    const where: FindOptionsWhere<StoreCart> = { id };
    const relations: FindOptionsRelations<StoreCart> = {
      items: { item: true },
    };
    return this.repo.findOne({ where, relations });
  }

  async addItemToCart(cartId: number, itemId: number) {
    return this.storeCartItemService.updateStoreCartItemQuantity(
      cartId,
      itemId,
      1,
    );
  }

  async removeItemFromCart(cartId: number, itemId: number) {
    return this.storeCartItemService.updateStoreCartItemQuantity(
      cartId,
      itemId,
      -1,
    );
  }
}
