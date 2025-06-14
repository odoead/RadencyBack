import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatNativeDateModule } from '@angular/material/core';
import { errorHandlingInterceptor } from './Shared/Interceptors/error-handling.interceptor';
import { ConfigService } from './Shared/Services/config.service';
import { provideState, provideStore, StoreModule } from '@ngrx/store';
import { bookingsReducer, bookingsFeatureKey } from './Shared/NGRX/bookings/bookingsReducer';
import { BookingsEffects } from './Shared/NGRX/bookings/bookingsEffect';
import { provideEffects } from '@ngrx/effects';

export function initializeConfig(configService: ConfigService) {
  return (): Promise<void> => {
    return configService.loadConfig();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
     provideState(bookingsFeatureKey, bookingsReducer),
      provideEffects(BookingsEffects),

    

    provideRouter(routes),
    provideHttpClient(
      withInterceptors([errorHandlingInterceptor])
    ),
    provideAnimationsAsync(),
    importProvidersFrom(MatNativeDateModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfig,
      deps: [ConfigService],
      multi: true
    }
  ]
};