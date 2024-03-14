import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mockStoreItems from '../src/test/mock-data/store-items';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { StoreItem } from '../src/database/entities/store-item.entity';
import { EntityManager, Repository } from 'typeorm';
import { StoreCart } from '../src/database/entities/store-cart.entity';
import { StoreCartItem } from '../src/database/entities/store-cart-item.entity';

describe('StoreCartController (e2e)', () => {
  let app: INestApplication;

  let entityManager: EntityManager;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const storeItemRepo = app.get<Repository<StoreItem>>(
      getRepositoryToken(StoreItem),
    );

    await storeItemRepo.save(mockStoreItems);

    entityManager = app.get(getEntityManagerToken());
  });

  function createCart() {
    return entityManager.save<StoreCart>(new StoreCart());
  }

  function loadCartFromDb(id: number) {
    return entityManager.findOne(StoreCart, {
      where: { id },
      relations: { items: { item: true } },
    });
  }

  function loadStoreItemFromDb(id: number) {
    return entityManager.findOneBy(StoreItem, { id });
  }

  function createStoreCartItem(
    cart: StoreCart,
    item: StoreItem,
    quantity: number,
  ) {
    const storeCartItem = new StoreCartItem();

    Object.assign<StoreCartItem, Partial<StoreCartItem>>(storeCartItem, {
      cart,
      item,
      quantity,
    });

    return entityManager.save<StoreCartItem>(storeCartItem);
  }

  describe('/api/store/cart/{:id} (GET)', () => {
    it('should return a 404 response code if no cart for the id exists', async () => {
      await request(app.getHttpServer())
        .get(`/api/store/cart/${Date.now()}`)
        .expect(404);
    });

    it('should return a cart if one for the exists for the given id', async () => {
      const cart = await createCart();

      const response = await request(app.getHttpServer())
        .get(`/api/store/cart/${cart.id}`)
        .expect(200);

      expect(response.body).toEqual({
        id: cart.id,
        items: [],
        totalPrice: 0,
        itemCount: 0,
        freeItemCount: 0,
        createdAt: cart.createdAt.toISOString(),
        updatedAt: cart.updatedAt.toISOString(),
      });
    });
  });

  describe('/api/store/cart (POST)', () => {
    it('should create a cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/store/cart')
        .expect(201);

      expect(res.body).toMatchObject(
        expect.objectContaining({
          id: expect.any(Number),
        }),
      );

      const { id } = res.body;

      const repoItem = await entityManager.findOneBy(StoreCart, { id });
      expect(res.body).toEqual({
        id: repoItem.id,
        items: [],
        totalPrice: 0,
        itemCount: 0,
        freeItemCount: 0,
        createdAt: repoItem.createdAt.toISOString(),
        updatedAt: repoItem.updatedAt.toISOString(),
      });
    });
  });

  describe('/api/store/cart/{:cartId}/item/{:itemId} (PUT)', () => {
    let cart: StoreCart;
    let item1: StoreItem;
    let item2: StoreItem;

    beforeEach(async () => {
      cart = await createCart();
      item1 = await loadStoreItemFromDb(1);
      item2 = await loadStoreItemFromDb(2);
    });

    it('should return 404 when cart is not found', async () => {
      await request(app.getHttpServer())
        .put('/api/store/cart/4040404/item/1')
        .expect(404)
        .expect(
          '{"message":"Cart not found","error":"Not Found","statusCode":404}',
        );
    });

    it('should return 404 when item is not found', async () => {
      await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/404404`)
        .expect(404)
        .expect(
          '{"message":"Item not found","error":"Not Found","statusCode":404}',
        );
    });

    it('should add item to cart with quantity 1 when the item is not in the cart', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(1);
      // check that cart has items
      expect(response.body.items[0].id).toEqual(item1.id);
      // check that item quantity is correct
      expect(response.body.items[0].quantity).toEqual(1);
    });

    it('should increment item quantity when the item exists is in the cart', async () => {
      const existingItem1Quantity = 2;
      await createStoreCartItem(cart, item1, existingItem1Quantity);

      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(1);
      // check that cart has item
      expect(response.body.items[0].id).toEqual(item1.id);
      // check that item quantity is correct
      expect(response.body.items[0].quantity).toEqual(
        existingItem1Quantity + 1,
      );
    });

    it('should increment only the quantity for only the item passed when the cart has multiple items', async () => {
      const existingItem1Quantity = 4;
      await createStoreCartItem(cart, item1, existingItem1Quantity);
      await createStoreCartItem(cart, item2, 1);

      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(2);
      // check that cart has items
      expect(response.body.items[0].id).toEqual(item1.id);
      // check that item quantity is correct
      expect(response.body.items[0].quantity).toEqual(
        existingItem1Quantity + 1,
      );
      // check that cart has item2
      expect(response.body.items[1].id).toEqual(item2.id);
      // check that item2 has right quantity
      expect(response.body.items[1].quantity).toEqual(1);
    });

    it('should return cart with correct item quantities after adding items to cart', async () => {
      // add item1 to cart
      await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      // add item2 to cart
      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(2);
      // check that cart has items
      expect(response.body.items[0].id).toEqual(item1.id);
      // check that item quantity is correct
      expect(response.body.items[0].quantity).toEqual(1);
      // check that cart has item2
      expect(response.body.items[1].id).toEqual(item2.id);
      // check that item2 has right quantity
      expect(response.body.items[1].quantity).toEqual(1);
    });

    it('should return cart with correct item quantities after incrementing quantity of item in cart', async () => {
      const existingItem1Quantity = 7;
      await createStoreCartItem(cart, item1, existingItem1Quantity);

      const existingItem2Quantity = 4;
      await createStoreCartItem(cart, item2, existingItem2Quantity);

      await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);
      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(2);
      // check that cart has items
      expect(response.body.items[0].id).toEqual(item1.id);
      // check that item quantity is correct
      expect(response.body.items[0].quantity).toEqual(
        existingItem1Quantity + 1,
      );
      // check that cart has item2
      expect(response.body.items[1].id).toEqual(item2.id);
      // check that item2 has right quantity
      expect(response.body.items[1].quantity).toEqual(
        existingItem2Quantity + 1,
      );
    });

    it('should return cart that matches information within the database after incrementing quantity of item in cart', async () => {
      const existingItem1Quantity = 8;
      await createStoreCartItem(cart, item1, existingItem1Quantity);

      const existingItem2Quantity = 4;
      await createStoreCartItem(cart, item2, existingItem2Quantity);

      await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);
      const response = await request(app.getHttpServer())
        .put(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toEqual(2);

      const cartFromDb = await loadCartFromDb(cart.id);

      expect(response.body.id).toEqual(cartFromDb.id);
      expect(response.body.items[0].id).toEqual(cartFromDb.items[0].item.id);
      expect(response.body.items[0].quantity).toEqual(
        cartFromDb.items[0].quantity,
      );

      expect(response.body.items[1].id).toEqual(cartFromDb.items[1].item.id);
      expect(response.body.items[1].quantity).toEqual(
        cartFromDb.items[1].quantity,
      );
    });
  });

  describe('/api/store/cart/{:cartId}/item/{:itemId} (DELETE)', () => {
    let cart: StoreCart;
    let item1: StoreItem;
    let item2: StoreItem;

    beforeEach(async () => {
      cart = await createCart();
      item1 = await loadStoreItemFromDb(1);
      item2 = await loadStoreItemFromDb(2);
    });

    it('should return 404 when cart is not found', async () => {
      await request(app.getHttpServer())
        .delete('/api/store/cart/4040404/item/1')
        .expect(404)
        .expect(
          '{"message":"Cart not found","error":"Not Found","statusCode":404}',
        );
    });

    it('should return 404 when item is not found', async () => {
      await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/404404`)
        .expect(404)
        .expect(
          '{"message":"Item not found","error":"Not Found","statusCode":404}',
        );
    });

    it('should update item in database to remove item from cart when cart has item with quantity of 1', async () => {
      await createStoreCartItem(cart, item1, 1);

      let existingDbCart = await loadCartFromDb(cart.id);

      // quick sanity check
      expect(existingDbCart.items[0].item.id).toEqual(item1.id);
      expect(existingDbCart.items[0].quantity).toEqual(1);

      const response = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items.length).toEqual(0);

      existingDbCart = await loadCartFromDb(cart.id);

      // lets confirm its gone :)
      expect(existingDbCart.items.length).toEqual(0);
    });

    it('should return cart with item removed when cart has item with quantity of 1', async () => {
      await createStoreCartItem(cart, item1, 1);

      const response = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items.length).toEqual(0);
    });

    it('should decrement item in cart when cart has item with quantity greater than 1', async () => {
      const existingItem1Quantity = 5;
      await createStoreCartItem(cart, item1, existingItem1Quantity);

      const response = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response.body.items.length).toEqual(1);
      expect(response.body.items[0].id).toEqual(item1.id);
      expect(response.body.items[0].quantity).toEqual(
        existingItem1Quantity - 1,
      );
    });

    it('should remove only the passed item when the cart has multiple items', async () => {
      await createStoreCartItem(cart, item1, 1);
      await createStoreCartItem(cart, item2, 1);

      // check that db has both items
      let existingDbCart = await loadCartFromDb(cart.id);

      // quick sanity check
      expect(existingDbCart.items[0].item.id).toEqual(item1.id);
      expect(existingDbCart.items[0].quantity).toEqual(1);
      expect(existingDbCart.items[1].item.id).toEqual(item2.id);
      expect(existingDbCart.items[1].quantity).toEqual(1);

      const response = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response.body.items.length).toEqual(1);
      expect(response.body.items[0].id).toEqual(item1.id);
      expect(response.body.items[0].quantity).toEqual(1);

      existingDbCart = await loadCartFromDb(cart.id);

      // check of db
      expect(existingDbCart.items[0].item.id).toEqual(item1.id);
      expect(existingDbCart.items[0].quantity).toEqual(1);
    });

    it('should return cart with correct item quantities after decrementing quantity of multiple items', async () => {
      const existingItem1Quantity = 5;
      await createStoreCartItem(cart, item1, existingItem1Quantity);
      const existingItem2Quantity = 8;
      await createStoreCartItem(cart, item2, existingItem2Quantity);

      // check that db has both items
      let existingDbCart = await loadCartFromDb(cart.id);

      // quick sanity check
      expect(existingDbCart.items[0].item.id).toEqual(item1.id);
      expect(existingDbCart.items[0].quantity).toEqual(existingItem1Quantity);
      expect(existingDbCart.items[1].item.id).toEqual(item2.id);
      expect(existingDbCart.items[1].quantity).toEqual(existingItem2Quantity);

      const response1 = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      expect(response1.body.items[0].id).toEqual(item1.id);
      expect(response1.body.items[0].quantity).toEqual(
        existingItem1Quantity - 1,
      );
      expect(response1.body.items[1].id).toEqual(item2.id);
      expect(response1.body.items[1].quantity).toEqual(existingItem2Quantity);

      const response2 = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response2.body.items[0].id).toEqual(item1.id);
      expect(response2.body.items[0].quantity).toEqual(
        existingItem1Quantity - 1,
      );
      expect(response2.body.items[1].id).toEqual(item2.id);
      expect(response2.body.items[1].quantity).toEqual(
        existingItem2Quantity - 1,
      );

      existingDbCart = await loadCartFromDb(cart.id);

      // check of db
      expect(existingDbCart.items[0].item.id).toEqual(item1.id);
      expect(existingDbCart.items[0].quantity).toEqual(
        existingItem1Quantity - 1,
      );
      expect(existingDbCart.items[1].item.id).toEqual(item2.id);
      expect(existingDbCart.items[1].quantity).toEqual(
        existingItem2Quantity - 1,
      );
    });

    it('should return empty cart when all items are removed from cart', async () => {
      await createStoreCartItem(cart, item1, 1);
      await createStoreCartItem(cart, item2, 1);

      // check that db has both items
      let existingDbCart = await loadCartFromDb(cart.id);

      // quick sanity check
      expect(existingDbCart.items.length).toEqual(2);

      const response1 = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item1.id}`)
        .expect(200);

      // check response
      expect(response1.body.items[0].id).toEqual(item2.id);
      expect(response1.body.items[0].quantity).toEqual(1);

      // check db
      existingDbCart = await loadCartFromDb(cart.id);
      expect(existingDbCart.items.length).toEqual(1);
      expect(existingDbCart.items[0].item.id).toEqual(item2.id);
      expect(existingDbCart.items[0].quantity).toEqual(1);

      const response2 = await request(app.getHttpServer())
        .delete(`/api/store/cart/${cart.id}/item/${item2.id}`)
        .expect(200);

      expect(response2.body.items.length).toEqual(0);

      existingDbCart = await loadCartFromDb(cart.id);

      // check of db
      expect(existingDbCart.items.length).toEqual(0);
    });
  });
});
