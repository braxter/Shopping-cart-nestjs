import { MigrationInterface, QueryRunner } from 'typeorm';

export class StoreItemsSeed1710356569714 implements MigrationInterface {
  name = 'StoreItemsSeed1710356569714';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "store_item" (id, itemSlug, name, description, price) VALUES (1, 'shirt', 'T-shirt', 'Just another T-shirt. Many Nice.', 12.99);`,
    );

    await queryRunner.query(
      `INSERT INTO "store_item" (id, itemSlug, name, description, price) VALUES (2, 'jeans', 'Jeans', 'Not so blue jeans', 25.00);`,
    );

    await queryRunner.query(
      `INSERT INTO "store_item" (id,itemSlug, name, description, price) VALUES (3, 'dress', 'Dress', 'Nice Dress, has pockets!', 20.65);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
