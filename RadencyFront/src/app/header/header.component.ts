import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as fromBookings from '../Shared/NGRX/bookings/bookingsSelectors';
import * as BookingsActions from '../Shared/NGRX/bookings/bookingsActions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,
    RouterLink, MatButtonModule,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;

  //Ngrx  
  bookingsCount$: Observable<number>;

  // classic implementation
  // bookingsCount = 0;

  constructor(
    private router: Router,
    private store: Store
    // classic implementation
    // private bookingService: BookingService
  ) {
    // Ngrx
    this.bookingsCount$ = this.store.select(fromBookings.selectBookingsCount);
  }

  ngOnInit(): void {
    // ===== NgRx IMPLEMENTATION =====
    this.store.dispatch(BookingsActions.loadBookings({ isPageLoad: false }));

    // classic implementation
    // this.loadBookingsCount();
  }

  //  classic implementation
  /* private loadBookingsCount(): void {
    this.bookingService.getAllBookings(false).subscribe({
      next: (bookings) => {
        this.bookingsCount = bookings.length;
      },
      error: (error) => {
        console.error('Error loading bookings count:', error);
        this.bookingsCount = 0;
      }
    });
  }
  */

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }
}