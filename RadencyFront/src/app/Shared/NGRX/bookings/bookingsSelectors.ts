import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingsState } from './bookingsState';
import { bookingsFeatureKey } from './bookingsReducer';

export const selectBookingsFeature =
    createFeatureSelector<BookingsState>(bookingsFeatureKey);

    // return data from the store
export const selectAllBookings = createSelector(
    selectBookingsFeature,
    (state) => state.bookings
);

export const selectCurrentBooking = createSelector(
    selectBookingsFeature,
    (state) => state.currentBooking
);

export const selectBookingsLoading = createSelector(
    selectBookingsFeature,
    (state) => state.loading
);

export const selectBookingsError = createSelector(
    selectBookingsFeature,
    (state) => state.error
);

export const selectBookingsCount = createSelector(
    selectBookingsFeature,
    (state) => state.bookings.length
);