import { createAction, props } from "@ngrx/store";
import { Booking } from "../../Entities/Booking";
import { UpdateBooking } from "../../Entities/UpdateBooking";
import { CreateBooking } from "../../Entities/CreateBooking";

export const loadBookings = createAction(
    '[Bookings] Load Bookings',
    props<{ isPageLoad: boolean }>()
);
export const loadBookingsSuccess = createAction(
    '[Bookings] Load Bookings Success',
    props<{ bookings: Booking[] }>()
);
export const loadBookingsFailure = createAction(
    '[Bookings] Load Bookings Failure',
    props<{ error: string }>()
);

// by Id
export const loadBooking = createAction(
    '[Bookings] Load Booking',
    props<{ id: number; isPageLoad: boolean }>()
);
export const loadBookingSuccess = createAction(
    '[Bookings] Load Booking Success',
    props<{ booking: Booking }>()
);
export const loadBookingFailure = createAction(
    '[Bookings] Load Booking Failure',
    props<{ error: string }>()
);

// Action to create a new booking
export const createBooking = createAction(
    '[Bookings] Create Booking',
    props<{ booking: CreateBooking }>()
);
export const createBookingSuccess = createAction(
    '[Bookings] Create Booking Success',
    props<{ booking: Booking }>()
);
export const createBookingFailure = createAction(
    '[Bookings] Create Booking Failure',
    props<{ error: string }>()
);

// Action to delete a booking
export const deleteBooking = createAction(
    '[Bookings] Delete Booking',
    props<{ id: number }>()
);
export const deleteBookingSuccess = createAction(
    '[Bookings] Delete Booking Success',
    props<{ id: number }>()
);
export const deleteBookingFailure = createAction(
    '[Bookings] Delete Booking Failure',
    props<{ error: string }>()
);

// Action to update a booking
export const updateBooking = createAction(
    '[Bookings] Update Booking',
    props<{ id: number; changes: UpdateBooking }>()
);
export const updateBookingSuccess = createAction(
    '[Bookings] Update Booking Success',
    props<{ booking: Booking }>()
);
export const updateBookingFailure = createAction(
    '[Bookings] Update Booking Failure',
    props<{ error: string }>()
);

// Clear current booking (for form reset)
export const clearCurrentBooking = createAction(
    '[Bookings] Clear Current Booking'
);