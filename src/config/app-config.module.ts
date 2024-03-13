import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './app.config';
import httpConfig from './http.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, httpConfig],
      envFilePath: ['.env'],
    }),
  ],
})
export class AppConfigModule {}
