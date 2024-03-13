import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONFIG, IDatabaseConfig } from '../config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const { file } =
          configService.getOrThrow<IDatabaseConfig>(DATABASE_CONFIG);

        return {
          type: 'sqlite',
          database: file,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
