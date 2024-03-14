import { StoreCart } from '../database/entities/store-cart.entity';
import { mock, mockReset } from 'jest-mock-extended';
import { StoreCartController } from './store-cart.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { StoreCartService } from '../services/store-cart.service';
import { NotFoundException } from '@nestjs/common';
import {
  StoreCartItemResponse,
  StoreCartResponse,
} from '../dtos/store-cart-dtos';
import { StoreItem } from '../database/entities/store-item.entity';
import { StoreCartItem } from '../database/entities/store-cart-item.entity';

describe('StoreCartController', () => {
  const mockStoreCartService = mock<StoreCartService>();

  let storeCartController: StoreCartController;

  let cartId: number;
  let mockCart: StoreCart;
  let itemId: number;
  let mockItem: StoreItem;
  let mockStoreCartItem: StoreCartItem;
  let mockCartResponse: StoreCartResponse;
  let mockCartItemResponse: StoreCartItemResponse;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StoreCartController],
      providers: [
        {
          provide: StoreCartService,
          useValue: mockStoreCartService,
        },
      ],
    }).compile();

    storeCartController = app.get(StoreCartController);
  });

  beforeEach(() => {
    mockReset(mockStoreCartService);
    const now = new Date();

    cartId = Date.now();
    itemId = Date.now() + 1;

    mockCart = new StoreCart();

    Object.assign(mockCart, {
      id: cartId,
      items: [],
      createdAt: now,
      updatedAt: now,
    });

    mockCartResponse = {
      id: mockCart.id,
      items: [],
      totalPrice: 0,
      freeItemCount: 0,
      itemCount: 0,
      createdAt: now,
      updatedAt: now,
    } as StoreCartResponse;

    mockItem = new StoreItem();
    Object.assign<StoreItem, Partial<StoreItem>>(mockItem, {
      id: itemId,
      name: 'test item',
      price: 1.01,
      itemSlug: 'test-item',
      description: 'Just another test item',
    });

    mockStoreCartItem = new StoreCartItem();
    Object.assign<StoreCartItem, Partial<StoreCartItem>>(mockStoreCartItem, {
      id: Date.now(),
      cart: mockCart,
      item: mockItem,
      quantity: 1,
    });

    mockCartItemResponse = {
      id: itemId,
      name: mockItem.name,
      unitPrice: mockItem.price,
      quantity: 1,
      description: mockItem.description,
      itemSlug: mockItem.itemSlug,
    } as StoreCartItemResponse;
  });

  describe('getCart', () => {
    it('should throw exception when cart is not found', async () => {
      mockStoreCartService.getCart.mockResolvedValue(null);

      const notFoundCartId = 404;

      await expect(storeCartController.getCart(notFoundCartId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockStoreCartService.getCart).toHaveBeenCalledWith(notFoundCartId);
    });

    it('should return response dto when cart is found', async () => {
      mockStoreCartService.getCart.mockResolvedValue(mockCart);

      await expect(storeCartController.getCart(cartId)).resolves.toEqual(
        mockCartResponse,
      );

      expect(mockStoreCartService.getCart).toHaveBeenCalledWith(cartId);
    });
  });

  describe('createCart', () => {
    it('should return response dto when cart is created', async () => {
      mockStoreCartService.createCart.mockResolvedValue(mockCart);

      await expect(storeCartController.createCart()).resolves.toEqual(
        mockCartResponse,
      );

      expect(mockStoreCartService.createCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('addItem', () => {
    it('should call storeCartService.addItemToCart with cartId and itemId', async () => {
      mockCart.items.push(mockStoreCartItem);
      mockCartResponse.items.push(mockCartItemResponse);
      mockCartResponse.totalPrice = mockItem.price;
      mockCartResponse.itemCount = 1;

      mockStoreCartService.addItemToCart.mockResolvedValue(mockCart);

      await expect(
        storeCartController.addItem(cartId, itemId),
      ).resolves.toEqual(mockCartResponse);

      expect(mockStoreCartService.addItemToCart).toHaveBeenCalledWith(
        cartId,
        itemId,
      );
    });

    it('should reject with error if storeCartService.addItemToCart throws error', async () => {
      const error = new Error('foo');

      mockStoreCartService.addItemToCart.mockRejectedValue(error);

      await expect(
        storeCartController.addItem(cartId, itemId),
      ).rejects.toThrowError(error);
    });
  });

  describe('removeItem', () => {
    it('should call storeCartService.removeItemFromCart with cartId and itemId', async () => {
      mockCart.items.push(mockStoreCartItem);
      mockCartResponse.items.push(mockCartItemResponse);
      mockCartResponse.totalPrice = mockItem.price;
      mockCartResponse.itemCount = 1;

      mockStoreCartService.removeItemFromCart.mockResolvedValue(mockCart);

      await expect(
        storeCartController.removeItem(cartId, itemId),
      ).resolves.toEqual(mockCartResponse);

      expect(mockStoreCartService.removeItemFromCart).toHaveBeenCalledWith(
        cartId,
        itemId,
      );
    });

    it('should reject with error if storeCartService.removeItemFromCart throws error', async () => {
      const error = new Error('foo');

      mockStoreCartService.removeItemFromCart.mockRejectedValue(error);

      await expect(
        storeCartController.removeItem(cartId, itemId),
      ).rejects.toThrowError(error);
    });
  });
});
