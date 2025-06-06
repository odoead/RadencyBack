import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any = {};
  private configLoaded = false;

  constructor(private http: HttpClient) { }

  async loadConfig(): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get('/assets/config.json'));
      this.config = data;
      this.configLoaded = true;
    } catch (error) {
      console.error('Error loading config:', error);


      this.config = {
        coworkingUrl: 'http://localhost:5247'
      };
      this.configLoaded = true;
    }
  }

  get coworkingUrl(): string {
    if (!this.configLoaded) {
      console.warn('Config not loaded yet, returning empty string');
    }
    return this.config?.coworkingUrl || '';
  }

  isConfigLoaded(): boolean {
    return this.configLoaded;
  }
}