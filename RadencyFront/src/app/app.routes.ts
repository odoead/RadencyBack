import { Routes } from '@angular/router';
import { MyBookingsPageComponent } from './my-bookings-page/my-bookings-page.component';
import { CoworkingDetailPageComponent } from './coworking-detail-page/coworking-detail-page.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { NotFoundComponent } from './Shared/SharedComponents/error/error.component';
import { AiComponent } from './ai/ai.component';
import { CoworkingListComponent } from './coworking-list/coworking-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/coworking', pathMatch: 'full' },

  {
    path: 'coworking',
    children: [
      {
        path: '',
        loadChildren: () => import('./Shared/Routes/coworkings.routes').then(m => m.coworkingsRoutes)
      }
    ]
  },
  {
    path: 'booking',
    children: [
      {
        path: '',
        loadChildren: () => import('./Shared/Routes/booking-form.routes').then(m => m.bookingRoutes)
      }
    ]
  },
  {
    path: 'my-bookings',
    loadComponent: () =>
      import('./my-bookings-page/my-bookings-page.component').then(m => m.MyBookingsPageComponent)
  },
  {
    path: 'ai',
    loadComponent: () =>
      import('./ai/ai.component').then(m => m.AiComponent)
  },
  {
    path: 'error/:code',
    loadComponent: () =>
      import('../app/Shared/SharedComponents/error/error.component').then(m => m.NotFoundComponent)
  },
  { path: '**', redirectTo: '/error/404' }
];