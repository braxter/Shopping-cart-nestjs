import { IsString } from 'class-validator';
import { registerAs } from '@nestjs/config';
import { validateConfig } from './config.utils';

export const DATABASE_CONFIG = 'db';

export interface IDatabaseConfig {
  file: string;
}

class DatabaseEnvironmentVariables {
  @IsString()
  DATABASE_FILE: string;

  constructor(DATABASE_FILE?: string) {
    this.DATABASE_FILE = DATABASE_FILE;
  }

  static fromEnv() {
    const { DATABASE_FILE = './var/app.db' } = process.env;

    return new DatabaseEnvironmentVariables(DATABASE_FILE);
  }

  toCconfigValues(): IDatabaseConfig {
    return {
      file: this.DATABASE_FILE,
    };
  }
}

export default registerAs<IDatabaseConfig>(
  DATABASE_CONFIG,
  (): IDatabaseConfig =>
    validateConfig(
      DatabaseEnvironmentVariables.fromEnv(),
      DatabaseEnvironmentVariables,
    ).toCconfigValues(),
);
