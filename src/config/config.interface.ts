import { APP_CONFIG, IAppConfig } from './app.config';
import { HTTP_CONFIG, IHttpConfig } from './http.config';

export interface IConfig {
  [APP_CONFIG]: IAppConfig;
  [HTTP_CONFIG]: IHttpConfig;
}
