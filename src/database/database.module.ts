import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONFIG, IDatabaseConfig } from '../config/database.config';
import { StoreItem } from './entities/store-item.entity';
import { DataSourceOptions } from 'typeorm';
import { APP_CONFIG, Environment, IAppConfig } from '../config/app.config';
import { StoreCart } from './entities/store-cart.entity';
import { StoreCartItem } from './entities/store-cart-item.entity';

export const typeormConfigFactory = (
  configService: ConfigService,
): DataSourceOptions => {
  const { file } = configService.getOrThrow<IDatabaseConfig>(DATABASE_CONFIG);
  const { nodeEnv } = configService.getOrThrow<IAppConfig>(APP_CONFIG);

  const config: DataSourceOptions = {
    type: 'sqlite',
    database: file,
    entities: [StoreItem, StoreCart, StoreCartItem],
  };

  if (nodeEnv === Environment.Test) {
    Object.assign(config, {
      database: ':memory:',
      synchronize: true,
    });
  }

  return config;
};

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeormConfigFactory,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
