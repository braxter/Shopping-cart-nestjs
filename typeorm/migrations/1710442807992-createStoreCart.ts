import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStoreCart1710442807992 implements MigrationInterface {
  name = 'CreateStoreCart1710442807992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "store_cart" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE TABLE "store_cart_item" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" numeric NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "cartId" integer, "itemId" integer, CONSTRAINT "UQ_2c763018365e26eed3bab6df8de" UNIQUE ("cartId", "itemId"), CONSTRAINT "FK_41d8e04efebc6c04056d7b1dc5c" FOREIGN KEY ("cartId") REFERENCES "store_cart" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_7e9799c25c2c508901af814ce43" FOREIGN KEY ("itemId") REFERENCES "store_item" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "store_cart"`);
    await queryRunner.query(`DROP TABLE "store_cart_item"`);
  }
}
