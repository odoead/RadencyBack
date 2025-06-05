import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeadersService {

  public static setPageLoad(): HttpHeaders {
    return new HttpHeaders().set('Page-Load', 'true');
  }
}
