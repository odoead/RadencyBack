import { Routes } from '@angular/router';

export const coworkingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../coworking-list/coworking-list.component').then(m => m.CoworkingListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../../coworking-detail-page/coworking-detail-page.component').then(m => m.CoworkingDetailPageComponent)
  }
];