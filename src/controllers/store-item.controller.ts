import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StoreItemService } from '../services/store-item.service';
import { StoreItemResponse } from '../dtos/store-item.dtos';

@Controller('/api/store/items')
@ApiTags('Store Items')
export class StoreItemController {
  constructor(private storeItemService: StoreItemService) {}

  @Get()
  @ApiOperation({
    summary: 'Gets all items available in the store.',
  })
  @ApiOkResponse({
    description: 'List of store items',
    type: [StoreItemResponse],
  })
  getStoreItems() {
    return this.storeItemService.getAll();
  }
}
