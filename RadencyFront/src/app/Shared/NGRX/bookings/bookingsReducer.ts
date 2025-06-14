import { createReducer, on } from "@ngrx/store";
import { initialBookingsState } from "./bookingsState";
import * as BookingsActions from './bookingsActions';

export const bookingsFeatureKey = 'bookings';

export const bookingsReducer = createReducer(
    initialBookingsState,

    // Load bookings
    on(BookingsActions.loadBookings, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(BookingsActions.loadBookingsSuccess, (state, { bookings }) => ({
        ...state,
        bookings: bookings.slice(),
        loading: false,
        error: null
    })),
    on(BookingsActions.loadBookingsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Load single booking
    on(BookingsActions.loadBooking, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(BookingsActions.loadBookingSuccess, (state, { booking }) => ({
        ...state,
        currentBooking: booking,
        loading: false,
        error: null
    })),
    on(BookingsActions.loadBookingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
        currentBooking: null
    })),

    // Create booking
    on(BookingsActions.createBooking, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(BookingsActions.createBookingSuccess, (state, { booking }) => ({
        ...state,
        bookings: [...state.bookings, booking],
        loading: false,
        error: null
    })),
    on(BookingsActions.createBookingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete booking
    on(BookingsActions.deleteBooking, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(BookingsActions.deleteBookingSuccess, (state, { id }) => ({
        ...state,
        bookings: state.bookings.filter(b => b.id !== id),
        loading: false,
        error: null
    })),
    on(BookingsActions.deleteBookingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update booking
    on(BookingsActions.updateBooking, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(BookingsActions.updateBookingSuccess, (state, { booking }) => ({
        ...state,
        bookings: state.bookings.map(b => b.id === booking.id ? booking : b),
        currentBooking: state.currentBooking?.id === booking.id ? booking : state.currentBooking,
        loading: false,
        error: null
    })),
    on(BookingsActions.updateBookingFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Clear current booking
    on(BookingsActions.clearCurrentBooking, (state) => ({
        ...state,
        currentBooking: null
    }))
);