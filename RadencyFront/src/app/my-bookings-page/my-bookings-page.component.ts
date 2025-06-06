import { Component, OnInit } from '@angular/core';
import { Booking } from '../Shared/Entities/Booking';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../Shared/SharedComponents/ConfirmDialog/confirm-dialog/confirm-dialog.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { BookingCardComponent } from "../booking-card/booking-card.component";
import { BookingService } from '../Shared/Services/booking.service';

@Component({
  selector: 'app-my-bookings-page',
  standalone: true,
  imports: [MatIconModule, CommonModule, ConfirmDialogComponent, BookingCardComponent],
  templateUrl: './my-bookings-page.component.html',
  styleUrl: './my-bookings-page.component.scss'
})
export class MyBookingsPageComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(
    private bookingService: BookingService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.load(true);
  }

  load(isPageLoad: boolean) {
    this.bookingService.getAllBookings(isPageLoad).subscribe(bs => this.bookings = bs);
  }

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
    ref.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.bookingService.deleteBooking(id).subscribe(() => this.load(false));
      }
    });
  }
}
