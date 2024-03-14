import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { StoreItem } from '../src/database/entities/store-item.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { StoreCartResponse } from '../src/dtos/store-cart-dtos';
import { arrRemove } from 'rxjs/internal/util/arrRemove';

const shirtId = 1;
const jeansId = 2;
const dressId = 3;

const storeItemsToTest = [
  {
    id: 1,
    name: 'T-shirt',
    itemSlug: 'shirt',
    description: 'Just another T-shirt. Many Nice.',
    price: 12.99,
  } as StoreItem,
  {
    id: 2,
    name: 'Jeans',
    itemSlug: 'jeans',
    description: 'Not so blue jeans',
    price: 25.0,
  } as StoreItem,
  {
    id: 3,
    name: 'Dress',
    itemSlug: 'dress',
    description: 'Nice Dress, has pockets!',
    price: 20.65,
  } as StoreItem,
];

describe('Shopping cart free item e2e', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const storeItemRepo = app.get<Repository<StoreItem>>(
      getRepositoryToken(StoreItem),
    );

    await storeItemRepo.save(storeItemsToTest);
  });

  async function addItem(cartId: number, itemId: number) {
    return request(app.getHttpServer()).put(
      `/api/store/cart/${cartId}/item/${itemId}`,
    );
  }

  //The customer bought 3 t-shirts.
  // - The total price on this case must be USD 25.98
  it('should have a total price of 25.98 when purchasing 3 shirts', async () => {
    const cart: StoreCartResponse = (
      await request(app.getHttpServer()).post('/api/store/cart')
    ).body;

    // add shirt 3 times
    await addItem(cart.id, shirtId);
    await addItem(cart.id, shirtId);
    const resultingCart = await addItem(cart.id, shirtId);

    expect(resultingCart.body.itemCount).toEqual(3);
    expect(resultingCart.body.totalPrice).toEqual(25.98);
  });

  // The customer bought 2 t-shirts and 2 jeans
  // - The total price on this case must be USD 62.99 (In this scenario, the item that is free is the t-shirt, since it is the cheapest item)
  it('should have a total price of 62.99 when purchasing 2 shirts and 2 jeans', async () => {
    const cart: StoreCartResponse = (
      await request(app.getHttpServer()).post('/api/store/cart')
    ).body;

    // add 2 shirts
    await addItem(cart.id, shirtId);
    await addItem(cart.id, shirtId);

    // add 2 jeans
    await addItem(cart.id, jeansId);
    const resultingCart = await addItem(cart.id, jeansId);

    expect(resultingCart.body.itemCount).toEqual(4);
    expect(resultingCart.body.totalPrice).toEqual(62.99);
  });
  // The customer bought 1 T-shirt, 2 Jeans and 3 Dress
  // - The total price on this case must be USD 91,30 (In this scenario, the items that are free are a t-shirt and Dress, since they are the cheapest items)
  it('should have a total price of 91.30 when purchasing 1 shirt, 2 jeans and 3 dresses', async () => {
    const cart: StoreCartResponse = (
      await request(app.getHttpServer()).post('/api/store/cart')
    ).body;

    // add 1 shirts
    await addItem(cart.id, shirtId);
    // add 2 jeans
    await addItem(cart.id, jeansId);
    await addItem(cart.id, jeansId);
    // add 3 dresses
    await addItem(cart.id, dressId);
    await addItem(cart.id, dressId);

    const resultingCart = await addItem(cart.id, dressId);

    expect(resultingCart.body.itemCount).toEqual(6);
    expect(resultingCart.body.totalPrice).toEqual(91.3);
  });
});
