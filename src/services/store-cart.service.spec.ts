import { mock, mockReset } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoreCart } from '../database/entities/store-cart.entity';
import { StoreCartService } from './store-cart.service';
import { StoreCartItemService } from './store-cart-item.service';

describe('StoreCartService', () => {
  const mockRepo = mock<Repository<StoreCart>>();
  const mockStoreCartItemService = mock<StoreCartItemService>();

  let storeCartService: StoreCartService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCartService,
        {
          provide: getRepositoryToken(StoreCart),
          useValue: mockRepo,
        },
        {
          provide: StoreCartItemService,
          useValue: mockStoreCartItemService,
        },
      ],
    }).compile();

    storeCartService = app.get(StoreCartService);
  });

  beforeEach(() => {
    mockReset(mockRepo);
    mockReset(mockStoreCartItemService);
  });

  describe('createCart', () => {
    it('should create a new cart', async () => {
      const mockCart = new StoreCart();

      mockRepo.create.mockReturnValue(mockCart);
      mockRepo.save.mockResolvedValue(mockCart);

      await expect(storeCartService.createCart()).resolves.toEqual(mockCart);

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockRepo.save).toHaveBeenCalledWith(mockCart);
    });
  });

  describe('getCart', () => {
    it('should return cart from repo', async () => {
      const cartId = Date.now();

      const mockCart = new StoreCart();

      mockCart.id = cartId;

      mockRepo.findOne.mockResolvedValue(mockCart);

      await expect(storeCartService.getCart(cartId)).resolves.toEqual(mockCart);

      expect(mockRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: cartId },
        }),
      );
    });
  });

  describe('addItemToCart', () => {
    it('should call storeCartItemService.updateStoreCartItemQuantity to modify quantity by 1', async () => {
      const mockCart = {
        id: 11,
      } as StoreCart;

      mockStoreCartItemService.updateStoreCartItemQuantity.mockResolvedValue(
        mockCart,
      );

      await expect(storeCartService.addItemToCart(11, 22)).resolves.toEqual(
        mockCart,
      );

      expect(
        mockStoreCartItemService.updateStoreCartItemQuantity,
      ).toHaveBeenCalledWith(11, 22, 1);
    });
  });

  describe('removeItemFromCart', () => {
    it('should call storeCartItemService.updateStoreCartItemQuantity to modify quantity by -11', async () => {
      const mockCart = {
        id: 11,
      } as StoreCart;

      mockStoreCartItemService.updateStoreCartItemQuantity.mockResolvedValue(
        mockCart,
      );

      await expect(
        storeCartService.removeItemFromCart(11, 22),
      ).resolves.toEqual(mockCart);

      expect(
        mockStoreCartItemService.updateStoreCartItemQuantity,
      ).toHaveBeenCalledWith(11, 22, -1);
    });
  });
});
