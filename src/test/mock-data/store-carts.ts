import { StoreCart } from '../../database/entities/store-cart.entity';
import { StoreItem } from '../../database/entities/store-item.entity';
import { StoreCartItem } from '../../database/entities/store-cart-item.entity';

function createStoreCart(props: Partial<StoreCart>): StoreCart {
  return Object.assign(new StoreCart(), props);
}

export const mockCart = createStoreCart({
  id: 1,
  items: [],
});

export const mockItem1 = {
  id: 1,
  name: 'test item 1',
  price: 22.22,
} as StoreItem;

export const mockStoreCartItem1 = {
  id: 1,
  cart: mockCart,
  item: mockItem1,
  quantity: 3,
} as StoreCartItem;

export const mockItem2 = {
  id: 2,
  name: 'test item 2',
  price: 11.33,
} as StoreItem;

export const mockStoreCartItem2 = {
  id: 2,
  cart: mockCart,
  item: mockItem2,
  quantity: 1,
} as StoreCartItem;

export const mockItem3 = {
  id: 3,
  name: 'test item 3',
  price: 33.33,
} as StoreItem;

export const mockStoreCartItem3 = {
  id: 3,
  cart: mockCart,
  item: mockItem3,
  quantity: 1,
} as StoreCartItem;
