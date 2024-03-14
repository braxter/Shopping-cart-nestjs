import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mockStoreItems from '../src/test/mock-data/store-items';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoreItem } from '../src/database/entities/store-item.entity';
import { Repository } from 'typeorm';

describe('StoreItemController (e2e)', () => {
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

    await storeItemRepo.save(mockStoreItems);
  });

  it('/ (GET) should items in the database', () => {
    return request(app.getHttpServer())
      .get('/api/store/items')
      .expect(200)
      .expect(JSON.stringify(mockStoreItems));
  });
});
