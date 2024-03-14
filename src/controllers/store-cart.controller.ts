import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  NotFoundException,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { StoreCartService } from '../services/store-cart.service';
import { StoreCart } from '../database/entities/store-cart.entity';
import { StoreCartItem } from '../database/entities/store-cart-item.entity';
import {
  StoreCartItemResponse,
  StoreCartResponse,
} from '../dtos/store-cart-dtos';
import { NotFoundResponse } from '../dtos/error-response.dtos';

@Controller('/api/store/cart')
export class StoreCartController {
  constructor(private storeCartService: StoreCartService) {}

  @Get('/:id')
  @ApiTags('Store Cart')
  @ApiOperation({
    summary: 'Gets cart by id',
  })
  @ApiOkResponse({
    description: 'Cart was found.',
    type: StoreCartResponse,
  })
  @ApiNotFoundResponse({
    description: 'Cart was not found.',
    type: NotFoundResponse,
  })
  async getCart(@Param('id') cartId: number) {
    const cart = await this.storeCartService.getCart(cartId);

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return this.mapCartToResponseDto(cart);
  }

  @Post('/')
  @HttpCode(201)
  @ApiTags('Store Cart')
  @ApiOperation({
    summary: 'Creates new cart',
  })
  @ApiCreatedResponse({
    description: 'Cart was created.',
    type: StoreCartResponse,
  })
  async createCart() {
    const cart = await this.storeCartService.createCart();

    return this.mapCartToResponseDto(cart);
  }

  @Put('/:cartId/item/:itemId')
  @ApiTags('Store Cart Item')
  @ApiOperation({
    summary: 'Adds item to cart, increases quantity by 1 if already in cart',
  })
  @ApiOkResponse({
    description: 'Cart was updated, adding or increasing item quantity',
    type: StoreCartResponse,
  })
  @ApiNotFoundResponse({
    description: 'Cart or Item was not found.',
    type: NotFoundResponse,
  })
  async addItem(
    @Param('cartId') cartId: number,
    @Param('itemId') itemId: number,
  ) {
    const cart = await this.storeCartService.addItemToCart(+cartId, +itemId);

    return this.mapCartToResponseDto(cart);
  }

  @Delete('/:cartId/item/:itemId')
  @ApiTags('Store Cart Item')
  @ApiOperation({
    summary:
      'Removes item to cart if quantity is 1, decreases quantity by 1 if items quantity is greater than 1',
  })
  @ApiOkResponse({
    description: 'Cart was updated, removing or decreasing item quantity',
    type: StoreCartResponse,
  })
  @ApiNotFoundResponse({
    description: 'Cart or Item was not found.',
    type: NotFoundResponse,
  })
  async removeItem(
    @Param('cartId') cartId: number,
    @Param('itemId') itemId: number,
  ) {
    const cart = await this.storeCartService.removeItemFromCart(
      +cartId,
      +itemId,
    );

    return this.mapCartToResponseDto(cart);
  }

  /**
   * helper method to map StoreCart to StoreCartResponse DTO
   */
  protected async mapCartToResponseDto(
    cart: StoreCart,
  ): Promise<StoreCartResponse> {
    const {
      id,
      itemCount,
      freeItemCount,
      items,
      totalPrice,
      createdAt,
      updatedAt,
    } = cart;

    return {
      id,
      freeItemCount,
      itemCount,
      totalPrice,
      items: this.mapStoreCartItems(items),
      createdAt,
      updatedAt,
    } as StoreCartResponse;
  }

  /**
   * helper method to map StoreCartItem array to StoreCartItemResponse DTO array
   */
  protected mapStoreCartItems(
    storeCartItems: StoreCartItem[],
  ): StoreCartItemResponse[] {
    return storeCartItems.map((storeCartItem) => {
      const { item, quantity } = storeCartItem;

      const { id, itemSlug, name, description, price } = item;

      return {
        id,
        itemSlug,
        name,
        description,
        unitPrice: price,
        quantity,
      };
    });
  }
}
