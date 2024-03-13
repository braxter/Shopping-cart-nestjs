import { registerAs } from '@nestjs/config';
import { IsIP, IsOptional, IsPort } from 'class-validator';
import { validateConfig } from './config.utils';

export const HTTP_CONFIG = 'http';

export interface IHttpConfig {
  address: string;
  port: number;
}

class HTTPEnvironmentVariables {
  @IsIP(4)
  @IsOptional()
  HTTP_ADDRESS: string;

  @IsPort()
  @IsOptional()
  HTTP_PORT: string;

  constructor(HTTP_ADDRESS?: string, HTTP_PORT?: string) {
    this.HTTP_ADDRESS = HTTP_ADDRESS;
    this.HTTP_PORT = HTTP_PORT;
  }

  static fromEnv(): HTTPEnvironmentVariables {
    const { HTTP_ADDRESS = '127.0.0.1', HTTP_PORT = '3123' } = process.env;

    return new HTTPEnvironmentVariables(HTTP_ADDRESS, HTTP_PORT);
  }

  toConfigValues(): IHttpConfig {
    return {
      address: this.HTTP_ADDRESS,
      port: Number(this.HTTP_PORT),
    };
  }
}

export default registerAs<IHttpConfig>(
  HTTP_CONFIG,
  (): IHttpConfig =>
    validateConfig(
      HTTPEnvironmentVariables.fromEnv(),
      HTTPEnvironmentVariables,
    ).toConfigValues(),
);
