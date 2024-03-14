import { Repository } from 'typeorm';
import { mock, mockReset } from 'jest-mock-extended';
import { StoreItem } from '../database/entities/store-item.entity';
import { StoreItemService } from './store-item.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import mockStoreItems from '../test/mock-data/store-items';

describe('StoreItemService', () => {
  const mockRepository = mock<Repository<StoreItem>>();

  let storeItemService: StoreItemService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        StoreItemService,
        { provide: getRepositoryToken(StoreItem), useValue: mockRepository },
      ],
    }).compile();

    storeItemService = app.get<StoreItemService>(StoreItemService);
  });

  beforeEach(() => {
    mockReset(mockRepository);
  });

  describe('getAll', () => {
    it('should return items fetched from repository', async () => {
      mockRepository.find.mockResolvedValue(mockStoreItems);

      await expect(storeItemService.getAll()).resolves.toEqual(mockStoreItems);
    });
  });
});
