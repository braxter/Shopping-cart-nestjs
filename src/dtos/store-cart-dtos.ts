import { ApiProperty } from '@nestjs/swagger';

export class StoreCartItemResponse {
  @ApiProperty()
  id?: number;

  @ApiProperty()
  itemSlug: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;
}

export class StoreCartResponse {
  @ApiProperty()
  id?: number;

  @ApiProperty({
    type: [StoreCartItemResponse],
  })
  items: StoreCartItemResponse[];

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  freeItemCount: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
