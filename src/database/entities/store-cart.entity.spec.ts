import * as mockStoreCarts from '../../test/mock-data/store-carts';
import { cloneDeep } from 'lodash';
import { StoreCart } from './store-cart.entity';
import { StoreCartItem } from './store-cart-item.entity';
describe('StoreCart', () => {
  let mockCart: StoreCart;
  let mockStoreCartItem1: StoreCartItem;
  let mockStoreCartItem2: StoreCartItem;
  let mockStoreCartItem3: StoreCartItem;

  beforeEach(async () => {
    mockCart = cloneDeep(mockStoreCarts.mockCart);
    mockStoreCartItem1 = cloneDeep(mockStoreCarts.mockStoreCartItem1);
    mockStoreCartItem2 = cloneDeep(mockStoreCarts.mockStoreCartItem2);
    mockStoreCartItem3 = cloneDeep(mockStoreCarts.mockStoreCartItem3);
  });

  describe('itemCount', () => {
    it('should return zero when there are not items', () => {
      expect(mockCart.itemCount).toEqual(0);
    });

    it('should return zero if called on a new cart', () => {
      expect(new StoreCart().itemCount).toEqual(0);
    });

    it('should return the total number of items in the cart', () => {
      mockCart.items.push(mockStoreCartItem1, mockStoreCartItem2);

      expect(mockCart.itemCount).toEqual(
        mockStoreCartItem1.quantity + mockStoreCartItem2.quantity,
      );
    });

    it('should return the total number of items in the cart', () => {
      mockCart.items.push(
        mockStoreCartItem1,
        mockStoreCartItem2,
        mockStoreCartItem3,
      );

      expect(mockCart.itemCount).toEqual(
        mockStoreCartItem1.quantity +
          mockStoreCartItem2.quantity +
          mockStoreCartItem2.quantity,
      );
    });
  });

  describe('freeItemCount', () => {
    it('should return zero when there are not items', () => {
      expect(mockCart.freeItemCount).toEqual(0);
    });

    it('should return zero if called on a new cart', () => {
      expect(new StoreCart().freeItemCount).toEqual(0);
    });

    it('should return the total number of free items', () => {
      mockStoreCartItem1.quantity = 1;
      mockStoreCartItem2.quantity = 1;

      mockCart.items.push(mockStoreCartItem1, mockStoreCartItem2);

      expect(mockCart.freeItemCount).toEqual(0);

      mockStoreCartItem1.quantity = 1;
      mockStoreCartItem2.quantity = 2;

      expect(mockCart.freeItemCount).toEqual(1);

      mockStoreCartItem1.quantity = 3;
      mockStoreCartItem2.quantity = 2;

      expect(mockCart.freeItemCount).toEqual(1);

      mockStoreCartItem1.quantity = 10;
      mockStoreCartItem2.quantity = 10;

      expect(mockCart.freeItemCount).toEqual(6);
    });
  });

  describe('totalPrice', () => {
    it('should return zero when there are not items', () => {
      expect(mockCart.totalPrice).toEqual(0);
    });

    it('should return zero if called on a new cart', () => {
      expect(new StoreCart().totalPrice).toEqual(0);
    });
  });

  it('should return the total price of items, excluding free items', async () => {
    mockStoreCartItem1.item.price = 1.01;
    mockStoreCartItem2.item.price = 3.04;
    mockStoreCartItem3.item.price = 5.45;

    mockStoreCartItem1.quantity = 1;
    mockStoreCartItem2.quantity = 1;

    mockCart.items.push(mockStoreCartItem1, mockStoreCartItem2);

    // no free items
    // item1 + item2
    expect(mockCart.totalPrice).toEqual(4.05);

    mockStoreCartItem1.quantity = 1;
    mockStoreCartItem2.quantity = 2;

    // 1 free item
    // 1 x item1 free, cost is 2 x item2
    expect(mockCart.totalPrice).toEqual(6.08);

    mockStoreCartItem1.quantity = 1;
    mockStoreCartItem2.quantity = 5;

    // 2 free items
    // 1x item1 and 1x item2 free, cost is 4 x item 2
    expect(mockCart.totalPrice).toEqual(12.16);

    mockCart.items.push(mockStoreCartItem3);

    mockStoreCartItem1.quantity = 3;
    mockStoreCartItem2.quantity = 10;
    mockStoreCartItem3.quantity = 1;

    // 4 free items
    // 3 x item 1 and 1 x item2 free
    // total cost is 9x item 2 and 1 x item 3
    expect(mockCart.totalPrice).toEqual(32.81);
  });
});
