import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatNativeDateModule } from '@angular/material/core';
import { errorHandlingInterceptor } from './Shared/Interceptors/error-handling.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
  provideHttpClient(
    withInterceptors([ errorHandlingInterceptor])
  ),
  provideAnimationsAsync(),
  importProvidersFrom(MatNativeDateModule)]
};
