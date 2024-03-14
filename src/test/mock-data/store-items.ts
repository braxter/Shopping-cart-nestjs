import { StoreItem } from '../../database/entities/store-item.entity';

const mockStoreItems = [
  {
    id: 1,
    itemSlug: 'test-item-1',
    name: 'Test Item 1',
    description: 'A test Item',
    price: 1.0,
  } as StoreItem,
  {
    id: 2,
    itemSlug: 'test-item-2',
    name: 'Test Item 2',
    description: 'Just another test item',
    price: 2.22,
  } as StoreItem,
];

export default mockStoreItems;
