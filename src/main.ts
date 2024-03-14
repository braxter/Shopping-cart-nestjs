import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HTTP_CONFIG, IHttpConfig } from './config/http.config';
import { INestApplication, Logger } from '@nestjs/common';
import { APP_CONFIG, IAppConfig } from './config/app.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function initializeSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Shopping Cart')
    .setDescription('API docs for the shopping cart')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('ApplicationBootstrap');

  const config = app.get(ConfigService);

  const { nodeEnv } = config.getOrThrow<IAppConfig>(APP_CONFIG);
  const { address, port } = config.getOrThrow<IHttpConfig>(HTTP_CONFIG);

  await initializeSwagger(app);

  await app.listen(port, address).then(async () => {
    logger.debug(
      `App listening on in ${nodeEnv} mode at address: ${address} port:${port}.`,
    );
    logger.debug(`Browse to ${await app.getUrl()}`);
  });
}
bootstrap();
