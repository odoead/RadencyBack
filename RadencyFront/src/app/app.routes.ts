import { Routes } from '@angular/router';
import { MyBookingsPageComponent } from './my-bookings-page/my-bookings-page.component';
import { CoworkingDetailPageComponent } from './coworking-detail-page/coworking-detail-page.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { NotFoundComponent } from './Shared/SharedComponents/error/error.component';
import { AiComponent } from './ai/ai.component';
import { CoworkingListComponent } from './coworking-list/coworking-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/coworkings', pathMatch: 'full' },
  { path: 'coworking/:id', component: CoworkingDetailPageComponent },
  { path: 'booking/new', component: BookingFormComponent },
  { path: 'booking/edit/:id', component: BookingFormComponent },
  { path: 'my-bookings', component: MyBookingsPageComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'error/:code', component: NotFoundComponent },
  { path: 'ai', component: AiComponent },
  {path:'coworkings',component:CoworkingListComponent},


  { path: 'error', redirectTo: '/error/404' },
  { path: '**', redirectTo: '/error/404' }];
