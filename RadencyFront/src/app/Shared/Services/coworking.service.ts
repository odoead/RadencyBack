import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CoworkingDetails, } from '../Entities/CoworkingDetails';
import { catchError, Observable, throwError } from 'rxjs';
import { AvailabilityCheck } from '../Entities/AvailabilityCheck';
import { HeadersService } from './headers.service';
import { UnavailableWorkspaceUnitLOCRanges, } from '../Entities/UnavailableWorkspaceUnitLOCRanges';
import { environment } from '../../../environments/environment.development';
import { ConfigService } from './config.service';
import { CoworkingMin } from '../Entities/CoworkingMin';

@Injectable({
  providedIn: 'root'
})
export class CoworkingService {

  private getApiUrl(): string {
    const baseUrl = this.configService.coworkingUrl;
    if (!baseUrl) {
      console.error('Config not loaded or coworkingUrl is empty');
      return '/api/coworking';
    }
    return `${baseUrl}/api/coworking`;
  } constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getAllCoworkingsDetails(isPageLoad: boolean): Observable<CoworkingMin[]> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.get<CoworkingMin[]>(this.getApiUrl())
      .pipe(catchError(this.handleError));
  }

  getCoworkingDetailsById(id: number, isPageLoad: boolean): Observable<CoworkingDetails> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.get<CoworkingDetails>(`${this.getApiUrl()}/${id}`)
      .pipe(catchError(this.handleError));
  }

  isLOCTimeRangeAvaliable(data: AvailabilityCheck): Observable<boolean> {
    return this.http.post<boolean>(`${this.getApiUrl()}/check-availability`, data)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('CoworkingService error:', error);
    return throwError(() => new Error('An error occurred. Please try again later.'));
  }

  getUnavailableWorkspaceUnitLOCRanges(workspaceUnitId: number, isPageLoad: boolean, excludeBookingId?: number): Observable<UnavailableWorkspaceUnitLOCRanges> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;

    let params = new HttpParams();
    if (excludeBookingId !== undefined && excludeBookingId !== null) {
      params = params.set('excludeBookingId', excludeBookingId.toString());
    }
    return this.http.get<UnavailableWorkspaceUnitLOCRanges>(`${this.getApiUrl()}/unavailable-ranges/${workspaceUnitId}`, { params })
      .pipe(catchError(this.handleError));
  }
}
