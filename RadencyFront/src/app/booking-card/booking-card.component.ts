import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Booking } from '../Entities/Booking';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './booking-card.component.html',
  styleUrl: './booking-card.component.scss'
})
export class BookingCardComponent {
  @Input() booking!: Booking;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

}
