import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StoreItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  itemSlug: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('numeric', {
    precision: 8,
    scale: 2,
    transformer: {
      to(data: number): number {
        return data;
      },
      from(data: string): number {
        return parseFloat(data);
      },
    },
  })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
