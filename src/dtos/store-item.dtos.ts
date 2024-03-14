import { ApiProperty } from '@nestjs/swagger';

export class StoreItemResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  itemSlug: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
