import { Component, Input } from '@angular/core';
import { Amenity } from '../Entities/Amenity';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amenities-list',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, CommonModule],
  templateUrl: './amenities-list.component.html',
  styleUrl: './amenities-list.component.scss'
})
export class AmenitiesListComponent {
  @Input() amenities: Amenity[] = [];

}
