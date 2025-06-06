import { Injectable } from '@angular/core';
import { UpdateBooking } from '../Entities/UpdateBooking';
import { catchError, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CreateBooking } from '../Entities/CreateBooking';
import { HeadersService } from './headers.service';
import { environment } from '../../../environments/environment.development';
import { Booking } from '../Entities/Booking';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private getApiUrl(): string {
    const baseUrl = this.configService.coworkingUrl;
    if (!baseUrl) {
      console.error('Config not loaded or coworkingUrl is empty');
      return '/api/booking';
    }
    return `${baseUrl}/api/booking`;
  }

  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getAllBookings(isPageLoad: boolean): Observable<Booking[]> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.get<Booking[]>(this.getApiUrl())
      .pipe(catchError(this.handleError));
  }

  getBookingById(id: number, isPageLoad: boolean): Observable<Booking> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.get<Booking>(`${this.getApiUrl()}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createBooking(booking: CreateBooking): Observable<Booking> {
    return this.http.post<Booking>(this.getApiUrl(), booking)
      .pipe(catchError(this.handleError));
  }

  updateBooking(id: number, booking: UpdateBooking): Observable<Booking> {
    return this.http.patch<Booking>(`${this.getApiUrl()}/${id}`, booking)
      .pipe(catchError(this.handleError));
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('BookingService error:', error);
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }
}
