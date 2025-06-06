import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) { }

  async loadConfig() {
    const configPath = '/assets/config.json'; // Replace with environment variable or service if needed
    this.config = await firstValueFrom(this.http.get(configPath));
  }

  setConfig(config: any) {
    this.config = config;
  }

  get coworkingUrl(): string {
    return this.config?.coworkingUrl || '';
  }
}
