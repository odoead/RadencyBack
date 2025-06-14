import { Booking } from "../../Entities/Booking";

export interface BookingsState {
    bookings: Booking[];
    currentBooking: Booking | null;
    loading: boolean;
    error: string | null;
}

export const initialBookingsState: BookingsState = {
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,
};