import { APP_CONFIG, IAppConfig } from './app.config';
import { HTTP_CONFIG, IHttpConfig } from './http.config';
import { DATABASE_CONFIG, IDatabaseConfig } from './database.config';

export interface IConfig {
  [APP_CONFIG]: IAppConfig;
  [HTTP_CONFIG]: IHttpConfig;
  [DATABASE_CONFIG]: IDatabaseConfig;
}
