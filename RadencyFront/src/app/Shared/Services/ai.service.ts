import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';
import { catchError, Observable, throwError } from 'rxjs';
import { AiResponse } from '../Entities/AiResponse';
import { HeadersService } from './headers.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private getApiUrl(): string {
    const baseUrl = this.configService.coworkingUrl;
    if (!baseUrl) {
      console.error('Config not loaded or coworkingUrl is empty');
      return '/api/ai';
    }
    return `${baseUrl}/api/ai`;
  }

  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getAiResponse(query: string, isPageLoad: boolean): Observable<AiResponse> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.post<AiResponse>(`${this.getApiUrl()}/query`, { query  }).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    console.error('BookingService error:', error);
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }
}
