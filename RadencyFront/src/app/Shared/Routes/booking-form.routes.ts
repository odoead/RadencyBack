import { Routes } from '@angular/router';

export const bookingRoutes: Routes = [
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../../booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../../booking-form/booking-form.component').then(m => m.BookingFormComponent)
  }
   
];