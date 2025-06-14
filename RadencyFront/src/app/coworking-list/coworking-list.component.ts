import { Component, OnInit } from '@angular/core';
import { CoworkingMin } from '../Shared/Entities/CoworkingMin';
import { CoworkingService } from '../Shared/Services/coworking.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-coworking-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './coworking-list.component.html',
  styleUrl: './coworking-list.component.scss'
})
export class CoworkingListComponent implements OnInit {
  coworkings: CoworkingMin[] = [];
  error: string | null = null;

  constructor(private coworkingService: CoworkingService, private router: Router) { }

  ngOnInit(): void {
    this.coworkingService.getAllCoworkingsDetails(true).subscribe({
      next: (data) => {
        this.coworkings = data;
      },
    });
  }

  goToCoworking(id: number) {
    this.router.navigate(['/coworking', id]);
  }
}
