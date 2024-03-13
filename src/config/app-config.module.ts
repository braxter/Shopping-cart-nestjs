import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import httpConfig from './http.config';
import databaseConfig from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, httpConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
