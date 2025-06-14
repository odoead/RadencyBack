import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EMPTY, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { UpdateBooking } from '../Shared/Entities/UpdateBooking';
import { CreateBooking } from '../Shared/Entities/CreateBooking';
import { WorkspacesByType } from '../Shared/Entities/WorkspacesByType';
import { WorkspacesTypes } from '../Shared/Entities/WorkspacesTypes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkspaceSelectionComponent } from "../workspace-selection/workspace-selection.component";
import { CalendarComponent } from "../calendar/calendar.component";
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { Booking } from '../Shared/Entities/Booking';
import { DateTimeRange } from '../Shared/Entities/DateTimeRange';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BookingService } from '../Shared/Services/booking.service';
import { CoworkingService } from '../Shared/Services/coworking.service';
import { Store } from '@ngrx/store';

import * as fromBookings from '../Shared/NGRX/bookings/bookingsSelectors';
import * as BookingsActions from '../Shared/NGRX/bookings/bookingsActions';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    WorkspaceSelectionComponent,
    CalendarComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss'
})
export class BookingFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  workspaceTypes: WorkspacesByType[] = [];
  unavailableRanges: DateTimeRange[] = [];

  mode: 'new' | 'edit' = 'new';
  bookingId?: number;
  coworkingId!: number;

  // NgRx observables
  currentBooking$: Observable<Booking | null>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    // Classic services 
    private bookingService: BookingService,
    private coworkingService: CoworkingService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    //Ngrx 
    private store: Store
  ) {
    //Ngrx
    this.currentBooking$ = this.store.select(fromBookings.selectCurrentBooking);
    this.loading$ = this.store.select(fromBookings.selectBookingsLoading);
    this.error$ = this.store.select(fromBookings.selectBookingsError);
  }

  ngOnInit() {
    this.initializeForm();
    this.setupRouteHandling();
    this.subscribeToStoreUpdates();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(BookingsActions.clearCurrentBooking());
  }

  goToBookings() {
    this.router.navigate(['/my-bookings']);
  }

  private initializeForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      workspaceType: [null, Validators.required],
      selectedUnit: [null, Validators.required],
      dateTimeRange: [null, Validators.required]
    });
  }

  private setupRouteHandling() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log(id);
    if (id) {
      this.mode = 'edit';
      this.bookingId = id as unknown as number;

      // Ngrx
      this.store.dispatch(BookingsActions.loadBooking({
        id: this.bookingId,
        isPageLoad: true
      }));

      //Classic implementation
      // this.bookingService.getBookingById(this.bookingId, true).subscribe({
      //   next: (booking) => {
      //     if (booking) {
      //       this.patchForm(booking);
      //     }
      //   },
      //   error: (error) => {
      //     this.snack.open('Error loading booking data', 'Close', { duration: 3000 });
      //     console.error('Error loading booking:', error);
      //     this.router.navigate(['/']);
      //   }
      // });
      return;
    }

    this.route.queryParams.pipe(
      tap(params => {
        this.coworkingId = +params['coworkingId'];
        if (!this.coworkingId) {
          this.snack.open('Coworking space ID is required', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
          throw new Error('Coworking space ID is required');
        }
      }),

      switchMap(() => this.coworkingService.getCoworkingDetailsById(this.coworkingId, true)),
      tap(cw => {
        if (!cw) {
          this.router.navigate(['/']);
          throw new Error('Coworking details not found');
        }
        this.workspaceTypes = cw.workspaceTypes;
        this.setupFormSubscriptions();
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      error: (error) => {
        this.snack.open('Error loading coworking data', 'Close', { duration: 3000 });
        console.error('Error loading coworking:', error);
      }
    });
  }

  private subscribeToStoreUpdates() {
    this.currentBooking$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(booking => {
      if (booking && this.mode === 'edit') {
        this.patchForm(booking);
      }
    });

    // Subscribe to error changes
    this.error$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        console.error('Booking operation error:', error);
      }
    });
  }

  private setupFormSubscriptions() {
    this.form.get('selectedUnit')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((unitId: number | null) => {
      const workspaceType = this.form.get('workspaceType')?.value;

      if (unitId !== null && workspaceType !== null) {
        // Fetch unavailable ranges for the selected workspace unit
        this.coworkingService.getUnavailableWorkspaceUnitLOCRanges(unitId, true, this.mode === 'edit' ? this.bookingId : undefined).subscribe({
          next: rangesObj => {
            this.unavailableRanges = rangesObj.unavailableRanges || [];
          },
          error: () => {
            this.unavailableRanges = [];
            this.snack.open('Failed to fetch unavailable ranges. Please try again.', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.unavailableRanges = [];
      }
    });

    // Reset dateTimeRange and unavailableRanges when workspaceType changes
    this.form.get('workspaceType')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.form.get('selectedUnit')?.setValue(null, { emitEvent: false });
      this.form.get('dateTimeRange')?.setValue(null);
      this.unavailableRanges = [];
    });
  }

  private patchForm(b: Booking) {
    this.form.patchValue({
      name: b.userName,
      email: b.userEmail,
      workspaceType: b.workspaceType,
      selectedUnit: b.workspaceUnitId,
      dateTimeRange: {
        start: new Date(b.startTimeLOC),
        end: new Date(b.endTimeLOC),
      }
    });

    // to ensure that selectedUnit control is validated and any dependent logic is triggered
    if (b.workspaceUnitId) {
      this.form.get('selectedUnit')?.updateValueAndValidity({ emitEvent: true });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.snack.open('Please fill all required fields correctly.', 'Close', { duration: 3000 });
      this.markFormGroupTouched(this.form);
      return;
    }

    const { name, email, workspaceType, selectedUnit, dateTimeRange } = this.form.value;

    if (!dateTimeRange || !dateTimeRange.start || !dateTimeRange.end) {
      this.snack.open('Date and time range is invalid.', 'Close', { duration: 3000 });
      return;
    }
    if (!selectedUnit) {
      this.snack.open('Workspace unit is not selected.', 'Close', { duration: 3000 });
      return;
    }

    // Ngrx
    if (this.mode === 'new') {
      const createPayload: CreateBooking = {
        name: name,
        email: email,
        workspaceUnitId: selectedUnit,
        startTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.start),
        endTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.end),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone
      };


      this.store.dispatch(BookingsActions.createBooking({ booking: createPayload }));
    }
    else 
    {
      const updatePayload: UpdateBooking = {
        workspaceUnitId: selectedUnit,
        startTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.start),
        endTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.end),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      this.store.dispatch(BookingsActions.updateBooking({
        id: this.bookingId!,
        changes: updatePayload
      }));
    }

    //Classic implementation
    /*
    let call$;
    if (this.mode === 'new') {
      const createPayload: CreateBooking = {
        name: name,
        email: email,
        workspaceUnitId: selectedUnit,
        startTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.start),// "2025-06-12T05:05:00.000"
        endTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.end),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      call$ = this.bookingService.createBooking(createPayload);
    } else {
      const updatePayload: UpdateBooking = {
        workspaceUnitId: selectedUnit,
        startTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.start),
        endTimeLOC: this.formatDateWithoutTimezone(dateTimeRange.end),
        timeZoneId: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      call$ = this.bookingService.updateBooking(this.bookingId!, updatePayload);
    }

    call$.subscribe({
      next: () => {
        this.snack.open('Booking successful!', 'OK', { duration: 2000 });
        this.router.navigate(['/my-bookings']);
      },
      error: err => {
        this.snack.open(err.message || 'Time slot unavailable, choose another.', 'Close', { duration: 3000 });
      }
    });
    */
  }

  formatDateWithoutTimezone(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}