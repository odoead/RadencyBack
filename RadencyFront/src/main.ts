import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HttpClient, HttpClientModule, provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { importProvidersFrom } from '@angular/core';
import { ConfigService } from './app/Shared/Services/config.service';

// Load the configuration file before bootstrapping the application
fetch('/assets/config.json')
  .then(response => response.json())
  .then(config => {
    const configServiceFactory = () => {
      const configService = new ConfigService(new HttpClient({} as any));
      configService.setConfig(config);
      return configService;
    };

    bootstrapApplication(AppComponent, {
      providers: [importProvidersFrom(HttpClientModule), { provide: ConfigService, useFactory: configServiceFactory }]
    }).catch(err => console.error(err));
  });


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
