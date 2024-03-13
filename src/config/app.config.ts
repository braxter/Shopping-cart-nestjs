import { registerAs } from '@nestjs/config';
import { IsEnum, IsOptional } from 'class-validator';
import { validateConfig } from './config.utils';

export const APP_CONFIG = 'app';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

export interface IAppConfig {
  nodeEnv: Environment;
}

class AppEnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: string;

  constructor(NODE_ENV: string = Environment.Development) {
    this.NODE_ENV = NODE_ENV;
  }

  static fromEnv(): AppEnvironmentVariables {
    const { NODE_ENV } = process.env;

    return new AppEnvironmentVariables(NODE_ENV);
  }

  toConfigValues(): IAppConfig {
    return {
      nodeEnv: <Environment>this.NODE_ENV,
    };
  }
}

export default registerAs<IAppConfig>(
  APP_CONFIG,
  (): IAppConfig =>
    validateConfig(
      AppEnvironmentVariables.fromEnv(),
      AppEnvironmentVariables,
    ).toConfigValues(),
);
