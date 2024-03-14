import { MigrationInterface, QueryRunner } from 'typeorm';

export class StoreItems1710356527203 implements MigrationInterface {
  name = 'StoreItems1710356527203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "store_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemSlug" varchar NOT NULL, "name" varchar NOT NULL, "description" varchar NOT NULL, "price" numeric(8,2) NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "store_item"`);
  }
}
