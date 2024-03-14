import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { StoreCartController } from './controllers/store-cart.controller';
import { StoreItemController } from './controllers/store-item.controller';
import { StoreCartService } from './services/store-cart.service';
import { StoreCartItemService } from './services/store-cart-item.service';
import { StoreItemService } from './services/store-item.service';
import { StoreItem } from './database/entities/store-item.entity';
import { StoreCart } from './database/entities/store-cart.entity';
import { StoreCartItem } from './database/entities/store-cart-item.entity';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([StoreItem, StoreCart, StoreCartItem]),
  ],
  controllers: [AppController, StoreItemController, StoreCartController],
  providers: [StoreItemService, StoreCartService, StoreCartItemService],
})
export class AppModule {}
