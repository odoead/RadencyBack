import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';
import { CoworkingService } from '../Services/coworking.service';
import { BookingService } from '../Services/booking.service';
import { UpdateBooking } from '../Entities/UpdateBooking';
import { CreateBooking } from '../Entities/CreateBooking';
import { WorkspacesByType } from '../Entities/WorkspacesByType';
import { WorkspacesTypes } from '../Entities/WorkspacesTypes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceSelectionComponent } from "../workspace-selection/workspace-selection.component";
import { CalendarComponent } from "../calendar/calendar.component";
import { MatFormField } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Booking } from '../Entities/Booking';
import { DateTimeRange } from '../Entities/DateTimeRange';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [WorkspaceSelectionComponent, CalendarComponent, MatFormField, CommonModule,
    ReactiveFormsModule,
    MatSelectModule,],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit {
  form!: FormGroup;
  WorkspacesTypes = WorkspacesTypes;
  workspaceTypes: WorkspacesByType[] = [];
  unavailableRanges: DateTimeRange[] = [];

  mode: 'new' | 'edit' = 'new';
  bookingId?: number;
  coworkingId!: number;

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private coworkingService: CoworkingService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      workspaceType: [null, Validators.required],
      selectedUnits: [[], Validators.required],
      dateTimeRange: [null, Validators.required]
    });

    // determine mode & coworkingId
    this.route.queryParams.pipe(tap(params => {
      this.coworkingId = +params['coworkingId'];
      this.mode = params['id'] ? 'edit' : 'new';
      this.bookingId = params['id'] ? +params['id'] : undefined;
    }), switchMap(() => {
      // load coworking details (to get all workspace types/units)
      return this.coworkingService.getCoworkingDetailsById(this.coworkingId, true);
    }),
      tap(cw => {
        this.workspaceTypes = cw.workspaceTypes;
      }),
      switchMap(cw => {
        // if edit, fetch existing booking to patch form
        if (this.mode === 'edit' && this.bookingId) {
          return this.bookingService.getBookingById(this.bookingId, true);
        }
        return of(null);
      })
    ).subscribe(booking => {
      if (booking) {
        this.patchForm(booking);
      }
    });

    this.form.get('selectedUnits')!.valueChanges.subscribe(units => {
      if (units && units.length > 0) {
        this.bookingService.getUnavailableRanges(units[0]).subscribe(ranges => {
          this.unavailableRanges = ranges;
        });
      } else {
        this.unavailableRanges = [];
      }
    });
  }

  private patchForm(b: Booking) {
    this.form.patchValue({
      name: b.userId,
      email: b.userEmail,
      workspaceType: b.workspaceType,
      selectedUnits: [b.workspaceUnitId],
      dateTimeRange: {
        start: new Date(b.startTimeLOC),
        end: new Date(b.endTimeLOC),
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { name, email, workspaceType, selectedUnits, dateTimeRange } = this.form.value;
    let payload: CreateBooking | UpdateBooking;
    if (this.mode === 'new') {
      payload = {
        workspaceUnitId: selectedUnits[0],
        startTimeLOC: dateTimeRange.start.toISOString(),
        endTimeLOC: dateTimeRange.end.toISOString(),
        name: name,
        email: email,
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
    } else {
      payload = {
        workspaceUnitId: selectedUnits[0],
        startTimeLOC: dateTimeRange.start.toISOString(),
        endTimeLOC: dateTimeRange.end.toISOString(),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone

      };
    }

    const call$ = this.mode === 'new' ? this.bookingService.createBooking(payload as CreateBooking)
      : this.bookingService.updateBooking(this.bookingId!, payload as UpdateBooking);

    call$.subscribe({
      next: () => {
        this.snack.open('Booking successful!', 'OK', { duration: 2000 });
        this.router.navigate(['/my-bookings']);
      },
      error: err => {
        this.snack.open(err.message || 'Time slot unavailable, choose another.', 'Close', { duration: 3000 });
      }
    });
  }
}