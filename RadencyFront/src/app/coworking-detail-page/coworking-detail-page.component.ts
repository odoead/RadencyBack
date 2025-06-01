import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { CoworkingDetails } from '../Entities/CoworkingDetails';
import { ActivatedRoute, Router } from '@angular/router';
import { CoworkingService } from '../Services/coworking.service';
import { WorkspacesByType } from '../Entities/WorkspacesByType';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AmenitiesListComponent } from "../amenities-list/amenities-list.component";
import { WorkspaceCardComponent } from "../workspace-card/workspace-card.component";
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-coworking-detail-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, AmenitiesListComponent, WorkspaceCardComponent, MatGridListModule],
  templateUrl: './coworking-detail-page.component.html',
  styleUrl: './coworking-detail-page.component.scss'
})
export class CoworkingDetailPageComponent implements OnInit {

  coworking$!: Observable<CoworkingDetails>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coworkingService: CoworkingService
  ) { }

  ngOnInit(): void {
    this.coworking$ = this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        if (!id) return of(null as any);
        return this.coworkingService.getCoworkingDetailsById(id,true);
      })
    );
  }

  onBookNow(workspace: WorkspacesByType) {
    this.router.navigate(['/booking/new'], {
      queryParams: { coworkingId: (this.route.snapshot.params['id']), type: workspace.type }
    });
  }
}
