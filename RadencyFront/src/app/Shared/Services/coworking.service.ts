import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CoworkingDetails, } from '../Entities/CoworkingDetails';
import { catchError, Observable, throwError } from 'rxjs';
import { AvailabilityCheck } from '../Entities/AvailabilityCheck';
import { HeadersService } from './headers.service';
import { UnavailableWorkspaceUnitLOCRanges, } from '../Entities/UnavailableWorkspaceUnitLOCRanges';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CoworkingService {

  private apiUrl = environment.coworkingUrl + "/api" + "/coworking";

  constructor(private http: HttpClient) { }

  getCoworkingDetailsById(id: number, isPageLoad: boolean): Observable<CoworkingDetails> {
    isPageLoad ? HeadersService.setPageLoad() : undefined;
    return this.http.get<CoworkingDetails>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  checkAvailability(data: AvailabilityCheck): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/check-availability`, data)
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
    return this.http.get<UnavailableWorkspaceUnitLOCRanges>(`${this.apiUrl}/unavailable-ranges/${workspaceUnitId}`, { params })
      .pipe(catchError(this.handleError));
  }
}
