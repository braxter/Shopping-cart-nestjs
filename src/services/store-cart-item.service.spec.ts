import { EntityManager } from 'typeorm';
import { mock, mockReset } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { StoreCartItemService } from './store-cart-item.service';
import { getEntityManagerToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StoreCart } from '../database/entities/store-cart.entity';
import { StoreItem } from '../database/entities/store-item.entity';
import { StoreCartItem } from '../database/entities/store-cart-item.entity';
import * as mockStoreCarts from '../test/mock-data/store-carts';
import { cloneDeep } from 'lodash';

describe('StoreCartItemService', () => {
  const mockEntityMangaer = mock<EntityManager>();

  let storeCartItemService: StoreCartItemService;
  let mockCart: StoreCart;
  let mockItem1: StoreItem;
  let mockItem2: StoreItem;
  let mockItem3: StoreItem;
  let mockStoreCartItem1: StoreCartItem;
  let mockStoreCartItem2: StoreCartItem;
  let mockStoreCartItem3: StoreCartItem;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCartItemService,
        {
          provide: getEntityManagerToken(),
          useValue: mockEntityMangaer,
        },
      ],
    }).compile();

    storeCartItemService = app.get(StoreCartItemService);
  });

  beforeEach(async () => {
    mockReset(mockEntityMangaer);

    mockCart = cloneDeep(mockStoreCarts.mockCart);
    mockItem1 = cloneDeep(mockStoreCarts.mockItem1);
    mockItem2 = cloneDeep(mockStoreCarts.mockItem2);
    mockItem3 = cloneDeep(mockStoreCarts.mockItem3);
    mockStoreCartItem1 = cloneDeep(mockStoreCarts.mockStoreCartItem1);
    mockStoreCartItem2 = cloneDeep(mockStoreCarts.mockStoreCartItem2);
    mockStoreCartItem3 = cloneDeep(mockStoreCarts.mockStoreCartItem3);
  });

  function doEntityMangerTransactionMock(
    cart: StoreCart | null,
    item: StoreItem | null,
  ) {
    mockEntityMangaer.findOne.mockResolvedValueOnce(cart);
    mockEntityMangaer.findOne.mockResolvedValueOnce(item);

    mockEntityMangaer.transaction.mockImplementationOnce(
      // @ts-expect-error not matching proper signature
      (fn: (entityManager: EntityManager) => any) => {
        return fn(mockEntityMangaer);
      },
    );
  }

  describe('updateStoreCartItemQuantity', () => {
    it('should start a transaction', async () => {
      await storeCartItemService.updateStoreCartItemQuantity(1, 1, 1);

      expect(mockEntityMangaer.transaction).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    it('should throw and NotFoundException if cart is not found', async () => {
      doEntityMangerTransactionMock(null, null);

      await expect(
        storeCartItemService.updateStoreCartItemQuantity(
          mockCart.id,
          mockItem1.id,
          1,
        ),
      ).rejects.toThrowError(new NotFoundException('Cart not found'));
    });

    it('should throw and NotFoundException if cart is found but item is not', async () => {
      doEntityMangerTransactionMock(mockCart, null);

      await expect(
        storeCartItemService.updateStoreCartItemQuantity(
          mockCart.id,
          mockItem1.id,
          1,
        ),
      ).rejects.toThrowError(new NotFoundException('Item not found'));
    });

    it('should add a StoreCartItem to the StoreCart.items array when it is not present', async () => {
      doEntityMangerTransactionMock(mockCart, mockItem1);

      const result = await storeCartItemService.updateStoreCartItemQuantity(
        mockCart.id,
        mockItem1.id,
        1,
      );

      expect(result.id).toEqual(mockCart.id);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toEqual(1);
      expect(result.items[0].item).toEqual(mockItem1);
      expect(result.items[0].quantity).toEqual(1);

      // confirm that new cartItem was saved
      expect(mockEntityMangaer.save).toHaveBeenCalledWith(
        expect.objectContaining({
          cart: mockCart,
          item: mockItem1,
          quantity: 1,
        }),
      );
    });

    it('should remove a storeCartItem from the StoreCart.items if quantity change results in a 0 quantity', async () => {
      mockCart.items.push({ ...mockStoreCartItem1, quantity: 1 });

      doEntityMangerTransactionMock(mockCart, mockItem1);

      const result = await storeCartItemService.updateStoreCartItemQuantity(
        mockCart.id,
        mockItem1.id,
        -1,
      );

      expect(result.id).toEqual(mockCart.id);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toEqual(0);

      // confirm that new cartItem was saved
      expect(mockEntityMangaer.remove).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockStoreCartItem1.id,
          cart: mockCart,
          item: mockItem1,
          quantity: 0,
        }),
      );
    });

    it('should update quantity of storeCart.item when it exists already', async () => {
      mockCart.items.push(mockStoreCartItem1);

      doEntityMangerTransactionMock(mockCart, mockItem1);

      const expectedQuantity = mockStoreCartItem1.quantity + 1;

      const result = await storeCartItemService.updateStoreCartItemQuantity(
        mockCart.id,
        mockItem1.id,
        1,
      );

      expect(result.id).toEqual(mockCart.id);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toEqual(1);
      expect(result.items[0].item).toEqual(mockItem1);
      expect(result.items[0].quantity).toEqual(expectedQuantity);

      // confirm that new cartItem was saved
      expect(mockEntityMangaer.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockStoreCartItem1.id,
          cart: expect.objectContaining({ id: mockCart.id }),
          item: expect.objectContaining({ id: mockItem1.id }),
          quantity: expectedQuantity,
        }),
      );
    });

    it('should update quantity of correct item when there are multiple items already', async () => {
      mockCart.items.push({ ...mockStoreCartItem1 });
      const expectedItem1Quantity = mockStoreCartItem1.quantity;
      mockCart.items.push({ ...mockStoreCartItem2 });
      const expectedItem2Quantity = mockStoreCartItem2.quantity + 1;
      mockCart.items.push({ ...mockStoreCartItem3 });
      const expectedItem3Quantity = mockStoreCartItem3.quantity;

      doEntityMangerTransactionMock(mockCart, mockItem2);

      const result = await storeCartItemService.updateStoreCartItemQuantity(
        mockCart.id,
        mockItem2.id,
        1,
      );

      expect(result.id).toEqual(mockCart.id);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toEqual(3);
      expect(result.items[0].item).toEqual(mockItem1);
      expect(result.items[0].quantity).toEqual(expectedItem1Quantity);
      expect(result.items[1].item).toEqual(mockItem2);
      expect(result.items[1].quantity).toEqual(expectedItem2Quantity);
      expect(result.items[2].item).toEqual(mockItem3);
      expect(result.items[2].quantity).toEqual(expectedItem3Quantity);

      // confirm that new cartItem was saved
      expect(mockEntityMangaer.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockStoreCartItem2.id,
          cart: expect.objectContaining({ id: mockCart.id }),
          item: expect.objectContaining({ id: mockItem2.id }),
          quantity: expectedItem2Quantity,
        }),
      );
    });
  });
});
