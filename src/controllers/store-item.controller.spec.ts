import { Test, TestingModule } from '@nestjs/testing';
import { StoreItemController } from './store-item.controller';
import { StoreItemService } from '../services/store-item.service';
import { mock, mockReset } from 'jest-mock-extended';
import mockStoreItems from '../test/mock-data/store-items';

describe('StoreItemController', () => {
  const mockStoreItemService = mock<StoreItemService>();

  let storeItemController: StoreItemController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StoreItemController],
      providers: [
        {
          provide: StoreItemService,
          useValue: mockStoreItemService,
        },
      ],
    }).compile();

    storeItemController = app.get<StoreItemController>(StoreItemController);
  });

  beforeEach(async () => {
    mockReset(mockStoreItemService);
  });

  describe('getStoreItems', () => {
    it('should return available items from StoreItemService', async () => {
      mockStoreItemService.getAll.mockResolvedValue(mockStoreItems);

      await expect(storeItemController.getStoreItems()).resolves.toEqual(
        mockStoreItems,
      );
    });
  });
});
