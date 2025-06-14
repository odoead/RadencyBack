import { Component, OnDestroy, OnInit } from '@angular/core';
import { Booking } from '../Shared/Entities/Booking';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../Shared/SharedComponents/ConfirmDialog/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BookingCardComponent } from "../booking-card/booking-card.component";
import { BookingService } from '../Shared/Services/booking.service';
import { AiComponent } from "../ai/ai.component";
import { Observable, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromBookings from '../Shared/NGRX/bookings/bookingsSelectors';
import * as BookingsActions from '../Shared/NGRX/bookings/bookingsActions';


@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [MatIconModule, CommonModule, ConfirmDialogComponent, BookingCardComponent, AiComponent],
  templateUrl: './my-bookings-page.component.html',
  styleUrl: './my-bookings-page.component.scss'
})
export class MyBookingsPageComponent implements OnInit, OnDestroy {
  //Ngrx
  bookings$: Observable<Booking[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  //clasic implementation
  // bookings: Booking[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    // Classic
    private bookingService: BookingService,
    private dialog: MatDialog,
    private router: Router,
    //NgR
    private store: Store
  ) {
    //Ngrx
    this.bookings$ = this.store.select(fromBookings.selectAllBookings);
    this.loading$ = this.store.select(fromBookings.selectBookingsLoading);
    this.error$ = this.store.select(fromBookings.selectBookingsError);
  }

  ngOnInit() {
    //Ngrx
    this.store.dispatch(BookingsActions.loadBookings({ isPageLoad: true }));

    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        console.error('Bookings loading error:', error);
      }
    });

    //clasic implementation
    // this.load(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Clasic implementation
  /*
  load(isPageLoad: boolean) {
    this.bookingService.getAllBookings(isPageLoad).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }
  */

  onEdit(id: number) {
    this.router.navigate(['/booking/edit', id]);
  }

  onDelete(id: number) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Cancel Booking?',
        message: 'Are you sure you want to cancel this booking?'
      }
    });

    ref.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((confirm) => {
      if (confirm) {
        //Ngrx
        this.store.dispatch(BookingsActions.deleteBooking({ id }));

        //clasic implementation
        // this.bookingService.deleteBooking(id).subscribe({
        //   next: () => {
        //     this.load(false); // Reload the list after successful deletion
        //   },
        //   error: (error) => {
        //     console.error('Error deleting booking:', error);
        //   }
        // });
      }
    });
  }

  refreshBookings() {
    //Ngrx
    this.store.dispatch(BookingsActions.loadBookings({ isPageLoad: false }));

    //clasic implementation
    // this.load(false);
  }
}