import { Routes } from '@angular/router';
import { MyBookingsPageComponent } from './my-bookings-page/my-bookings-page.component';
import { CoworkingDetailPageComponent } from './coworking-detail-page/coworking-detail-page.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { NotFoundComponent } from './error/error.component';

export const routes: Routes = [
  { path: '', redirectTo: '/coworking/1', pathMatch: 'full' },
  { path: 'coworking/:id', component: CoworkingDetailPageComponent },
  { path: 'booking/new', component: BookingFormComponent },
  { path: 'booking/edit/:id', component: BookingFormComponent },
  { path: 'my-bookings', component: MyBookingsPageComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'errors/:code', component: NotFoundComponent },

  
  { path: 'errors', redirectTo: '/errors/404' },
  { path: '**', redirectTo: '/errors/404' }];
