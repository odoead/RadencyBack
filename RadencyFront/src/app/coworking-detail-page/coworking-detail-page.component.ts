import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { CoworkingDetails } from '../Shared/Entities/CoworkingDetails';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkspacesByType } from '../Shared/Entities/WorkspacesByType';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AmenitiesListComponent } from "../amenities-list/amenities-list.component";
import { WorkspaceCardComponent } from "../workspace-card/workspace-card.component";
import { MatGridListModule } from '@angular/material/grid-list';
import { CoworkingService } from '../Shared/Services/coworking.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-coworking-detail-page',
  standalone: true,
  imports: [CommonModule,
    MatButtonModule,
    MatIconModule,
    AmenitiesListComponent,
    WorkspaceCardComponent,
    MatGridListModule,
    RouterModule,
    MatCardModule],
  templateUrl: './coworking-detail-page.component.html',
  styleUrl: './coworking-detail-page.component.scss'
})
export class CoworkingDetailPageComponent implements OnInit {

  coworking$!: Observable<CoworkingDetails | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coworkingService: CoworkingService
  ) { }

  ngOnInit(): void {
    this.coworking$ = this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        if (!id) {
          this.router.navigate(['/errors/404']);
          return of(null);
        }
        return this.coworkingService.getCoworkingDetailsById(id, true);
      })
    );
  }

  onBookNow(workspace: WorkspacesByType) {
    this.router.navigate(['/booking/new'], {
      queryParams: { coworkingId: (this.route.snapshot.params['id']), type: workspace.type }
    });
  }
}