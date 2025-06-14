import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, mergeMap, of, tap } from "rxjs";
import * as BookingsActions from './bookingsActions';
import { BookingService } from "../../Services/booking.service";
import { Booking } from "../../Entities/Booking";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable()
export class BookingsEffects {
    constructor(
        private actions$: Actions,
        private bookingService: BookingService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    loadBookings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.loadBookings),
            mergeMap(action =>
                this.bookingService.getAllBookings(action.isPageLoad).pipe(
                    map(bookings => BookingsActions.loadBookingsSuccess({ bookings })),
                    catchError(err => {
                        const errorMsg = err.message || 'Failed to load bookings';
                        return of(BookingsActions.loadBookingsFailure({ error: errorMsg }));
                    })
                )
            )
        )
    );

    loadBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.loadBooking),
            mergeMap(({ id, isPageLoad }) =>
                this.bookingService.getBookingById(id, isPageLoad).pipe(
                    map((booking: Booking) => BookingsActions.loadBookingSuccess({ booking })),
                    catchError(err => {
                        const errorMsg = err.message || 'Failed to load booking';
                        return of(BookingsActions.loadBookingFailure({ error: errorMsg }));
                    })
                )
            )
        )
    );

    createBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.createBooking),
            mergeMap(({ booking }) =>
                this.bookingService.createBooking(booking).pipe(
                    map((createdBooking: Booking) =>
                        BookingsActions.createBookingSuccess({ booking: createdBooking })
                    ),
                    catchError(err =>
                        of(BookingsActions.createBookingFailure({
                            error: err.message || 'Time slot unavailable, choose another.'
                        }))
                    )
                )
            )
        )
    );

    deleteBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.deleteBooking),
            mergeMap(({ id }) =>
                this.bookingService.deleteBooking(id).pipe(
                    map(() => BookingsActions.deleteBookingSuccess({ id })),
                    catchError(err => {
                        const errorMsg = err.message || 'Failed to delete booking';
                        return of(BookingsActions.deleteBookingFailure({ error: errorMsg }));
                    })
                )
            )
        )
    );



    // Success/Failure notification effects
    createBookingSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.createBookingSuccess),
            tap(() => {
                this.snackBar.open('Booking successful!', 'OK', { duration: 2000 });
                this.router.navigate(['/my-bookings']);
            })
        ),
        { dispatch: false }
    );

    createBookingFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.createBookingFailure),
            tap(({ error }) => {
                this.snackBar.open(error, 'Close', { duration: 3000 });
            })
        ),
        { dispatch: false }
    );
    updateBooking$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.updateBooking),
            mergeMap(({ id, changes }) =>
                this.bookingService.updateBooking(id, changes).pipe(
                    map((updated: Booking) =>
                        BookingsActions.updateBookingSuccess({ booking: updated })
                    ),
                    catchError(err =>
                        of(BookingsActions.updateBookingFailure({ error: err.message || 'Update failed' }))
                    )
                )
            )
        )
    );

    reloadAfterUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.updateBookingSuccess),
            map(() => BookingsActions.loadBookings({ isPageLoad: false }))
        )
    );
    updateBookingSuccess$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.updateBookingSuccess),
            tap(() => {
                this.snackBar.open('Booking updated successfully', 'Close', { duration: 3000 });
                this.router.navigate(['/my-bookings']);
            })
        ),
        { dispatch: false }
    );

    updateBookingFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.updateBookingFailure),
            tap(({ error }) => {
                this.snackBar.open(`Update failed: ${error}`, 'Close', { duration: 3000 });
            })
        ),
        { dispatch: false }
    );

    loadBookingFailure$ = createEffect(() =>
        this.actions$.pipe(
            ofType(BookingsActions.loadBookingFailure),
            tap(({ error }) => {
                this.snackBar.open('Error loading booking data', 'Close', { duration: 3000 });
                this.router.navigate(['/']);
            })
        ),
        { dispatch: false }
    );
}