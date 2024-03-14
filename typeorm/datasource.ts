import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { AppConfigModule } from '../src/config/app-config.module';
import { typeormConfigFactory } from '../src/database/database.module';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Module({
  imports: [AppConfigModule],
})
class MinimalAppModule {}

async function getConfig() {
  const app = await NestFactory.create(MinimalAppModule, {
    logger: false,
  });

  const configService = app.get(ConfigService);

  const datasourceConfig = typeormConfigFactory(configService);

  return new DataSource({
    ...datasourceConfig,
    migrations: ['./typeorm/migrations/*.ts'],
  });
}

export default getConfig();
