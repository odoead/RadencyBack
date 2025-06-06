import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { WorkspacesTypes } from '../Shared/Entities/WorkspacesTypes';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateTimeRange } from '../Shared/Entities/DateTimeRange';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule, MatInputModule
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent {
  @Input() workspaceType: WorkspacesTypes | null = null;
  @Input() selectedRange: DateTimeRange | null = null;
  @Input() unavailableRanges: DateTimeRange[] = [];
  @Output() rangeChange = new EventEmitter<DateTimeRange | null>();
  @Output() validationChange = new EventEmitter<boolean>();

  startDateControl = new FormControl<Date | null>(null, Validators.required);
  startTimeControl = new FormControl<string | null>(null, [Validators.required, this.pastTimeValidator.bind(this)]);
  endDateControl = new FormControl<Date | null>(null, Validators.required);
  endTimeControl = new FormControl<string | null>(null, [Validators.required, this.endTimeValidator.bind(this)]);

  minDate = new Date().setHours(0, 0, 0, 0);
  maxEndDate: Date | null = null;

  ngOnInit(): void {
    this.subscribeToChanges();
    if (this.selectedRange) {
      this.initFromSelectedRange();
    }
    this.updateMaxEndDateConstraint(); // Initial update
    this.validateAndEmit(); // Initial validation
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Trigger on @input changes
    if (changes['selectedRange'] && !changes['selectedRange'].firstChange && this.selectedRange !== this.createDateTimeRangeFromControls()) {
      this.initFromSelectedRange();
    }
    if (changes['workspaceType']) {
      this.updateMaxEndDateConstraint();
      // When workspace type changes, existing dates might became invalid duration
      // Then retrigger dependent validations
      this.startDateControl.updateValueAndValidity();
      this.endDateControl.updateValueAndValidity();
      this.validateAndEmit();
    }
    if (changes['unavailableRanges']) {
      this.validateAndEmit();
    }
  }

  get timezoneName(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  //Performs validation of data fields on changes
  private subscribeToChanges(): void {
    this.startDateControl.valueChanges.subscribe((date) => {
      this.updateMaxEndDateConstraint();
      if (date) { this.endDateControl.updateValueAndValidity(); } // End date min depends on start date
      this.startTimeControl.updateValueAndValidity(); // Past time validation depends on start date
      this.validateAndEmit();
    });

    this.startTimeControl.valueChanges.subscribe(() => {
      this.validateAndEmit();
    });

    this.endDateControl.valueChanges.subscribe(() => {
      this.endTimeControl.updateValueAndValidity();
      this.validateAndEmit();
    });
    this.endTimeControl.valueChanges.subscribe(() => {
      this.validateAndEmit();
    });
  }

  private initFromSelectedRange(): void {
    if (!this.selectedRange) {
      this.startDateControl.reset();
      this.startTimeControl.reset();
      this.endDateControl.reset();
      this.endTimeControl.reset();
    } else {
      const { start, end } = this.selectedRange;
      this.startDateControl.setValue(start ? new Date(start) : null);
      this.startTimeControl.setValue(start ? this.formatTimeForInput(new Date(start)) : null);
      this.endDateControl.setValue(end ? new Date(end) : null);
      this.endTimeControl.setValue(end ? this.formatTimeForInput(new Date(end)) : null);
    }
    this.updateMaxEndDateConstraint();
    this.validateAndEmit();
  }




  private validateAndEmit(): void {
    const startDateValid = this.startDateControl.valid;
    const startTimeValid = this.startTimeControl.valid;
    const endDateValid = this.endDateControl.valid;
    const endTimeValid = this.endTimeControl.valid;

    const currentRange = this.createDateTimeRangeFromControls();
    let isOverlapping = false;
    let durationExceeded = false;

    if (currentRange) {
      isOverlapping = this.isOverlapping(currentRange);
      durationExceeded = this.isDurationExceeded(currentRange);
    }

    const allControlsValid = startDateValid && startTimeValid && endDateValid && endTimeValid;
    const overallValid = allControlsValid && currentRange !== null && !isOverlapping && !durationExceeded;

    this.validationChange.emit(overallValid);

    if (overallValid && currentRange) {
      this.rangeChange.emit(currentRange);
    } else {
      this.rangeChange.emit(null); //Retuln null if data not valid or range is incomplete
    }
  }

  private pastTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.startDateControl?.value) return null;

    // Ensure start date is set and valid
    const selectedDate = new Date(this.startDateControl.value);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const selectedDateTime = this.combineDateAndTime(this.startDateControl.value, control.value);
      if (selectedDateTime <= now) {
        return { pastTime: true };
      }
    }
    return null;
  }

  private endTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.endDateControl?.value || !this.startDateControl?.value || !this.startTimeControl?.value) {
      return null;
    }
    const currentRange = this.createDateTimeRangeFromControls();
    if (!currentRange || currentRange.end <= currentRange.start) {
      return { invalidEndTime: true };
    }
    return null;
  }

  private isOverlapping(range: DateTimeRange): boolean {
    if (!this.unavailableRanges || this.unavailableRanges.length === 0) {
      return false;
    }
    return this.unavailableRanges.some((unavailable) => {
      const unavailableStart = new Date(unavailable.start);
      const unavailableEnd = new Date(unavailable.end);
      return range.start < unavailableEnd && range.end > unavailableStart;
    });
  }

  isCurrentRangePotentiallyUnavailable(): boolean {
    const range = this.createDateTimeRangeFromControls();
    return !!range && this.isOverlapping(range);
  }

  private updateMaxEndDateConstraint(): void {
    if (this.startDateControl.value && this.workspaceType) {
      const maxDays = this.getMaxDurationDays();
      const newMaxEndDate = new Date(this.startDateControl.value);
      newMaxEndDate.setDate(newMaxEndDate.getDate() + maxDays);

      // If meeting room (max 1 day), max end date should be start date for date picker, time handles the rest
      if (this.workspaceType === WorkspacesTypes.MeetingRoom && maxDays === 1) {
        this.maxEndDate = new Date(this.startDateControl.value);
      }
      else {
        this.maxEndDate = newMaxEndDate;
      }

      // If current end date exceeds new max end date, reset or adjust it
      if (this.endDateControl.value && this.maxEndDate && this.endDateControl.value > this.maxEndDate) {
        this.endDateControl.setValue(this.maxEndDate);
      }
    } else {
      this.maxEndDate = null;
    }
  }

  getMaxDurationDays(): number {
    switch (this.workspaceType) {
      case WorkspacesTypes.MeetingRoom: return 1;
      case WorkspacesTypes.OpenSpace:
      case WorkspacesTypes.PrivateRoom: return 30;
      default: return 30; // Default max duration
    }
  }

  isDurationExceeded(range: DateTimeRange | null = this.createDateTimeRangeFromControls()): boolean {
    if (!range || !this.workspaceType) {
      return false;
    }
    const durationMs = range.end.getTime() - range.start.getTime();
    let maxDurationInMs = this.getMaxDurationDays() * 24 * 60 * 60 * 1000;


    // For MeetingRoom, booking cannot exceed 24 hours and should not cross into a second day unless within 24 hours.
    if (this.workspaceType === WorkspacesTypes.MeetingRoom) {
      if (durationMs > 24 * 60 * 60 * 1000) {
        return true;
      }

    }
    return durationMs > maxDurationInMs;
  }

  private combineDateAndTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  private formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  getMinStartTime(): string | null {
    if (!this.startDateControl.value) { return null; }

    const selectedStartDate = new Date(this.startDateControl.value);
    selectedStartDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedStartDate.getTime() === today.getTime()) {
      const now = new Date();
      return this.formatTimeForInput(now);
    }
    return '00:00'; // No minimum time on future dates
  }




  getMaxDurationText(): string {
    if (!this.workspaceType) {
      return '';
    }
    const days = this.getMaxDurationDays();
    return days === 1 ? '24 hours' : `${days} days`;
  }

  formatDuration(range: DateTimeRange | null = this.createDateTimeRangeFromControls()): string {
    if (!range) { return 'N/A'; }


    const durationInMs = range.end.getTime() - range.start.getTime();
    if (durationInMs <= 0) return 'Invalid duration';

    const days = Math.floor(durationInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((durationInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    return parts.length > 0 ? parts.join(', ') : '0 minutes';
  }


  getQuickDurations(): { label: string; hours: number }[] {
    if (!this.workspaceType) return [];
    const baseOptions = [
      { label: '1 hour', hours: 1 },
      { label: '2 hours', hours: 2 },
      { label: '4 hours', hours: 4 },
    ];

    //Book for all day if type is MeetingRoom
    if (this.workspaceType === WorkspacesTypes.MeetingRoom) {
      baseOptions.push({ label: 'Full Day (8h)', hours: 8 });
    }
    else { // OpenSpace, PrivateRoom
      baseOptions.push(
        { label: '8 hours', hours: 8 },
        { label: '1 day (24h)', hours: 24 },
        { label: '3 days', hours: 72 },
        { label: '1 week', hours: 168 }
      );
    }

    // Filter out durations that would exceed the max allowed for the workspace type
    const maxAllowedHours = this.getMaxDurationDays() * 24;
    return baseOptions.filter(d => d.hours <= maxAllowedHours);
  }

  setQuickDuration(duration: { label: string; hours: number }): void {
    if (!this.startDateControl.value || !this.startTimeControl.value) {
      return;
    }
    const startDateTime = this.combineDateAndTime(this.startDateControl.value, this.startTimeControl.value);
    const endDateTime = new Date(startDateTime.getTime() + duration.hours * 60 * 60 * 1000);

    if (this.maxEndDate && endDateTime > this.combineDateAndTime(this.maxEndDate, '23:59')) {
      const cappedEndDateTime = this.combineDateAndTime(this.maxEndDate, this.formatTimeForInput(endDateTime)); // keep original time on max date
      this.endDateControl.setValue(new Date(Math.min(endDateTime.getTime(), cappedEndDateTime.getTime())));
      this.endTimeControl.setValue(this.formatTimeForInput(new Date(Math.min(endDateTime.getTime(), cappedEndDateTime.getTime()))));
    } else {
      this.endDateControl.setValue(endDateTime);
      this.endTimeControl.setValue(this.formatTimeForInput(endDateTime));
    }
    this.validateAndEmit();
  }

  // Helper to compare if current control values match a given DateTimeRange and are valid
  createDateTimeRangeFromControls(): DateTimeRange | null {
    if (
      this.startDateControl.valid && this.startTimeControl.valid &&
      this.endDateControl.valid && this.endTimeControl.valid &&
      this.startDateControl.value && this.startTimeControl.value &&
      this.endDateControl.value && this.endTimeControl.value
    ) {
      const start = this.combineDateAndTime(this.startDateControl.value, this.startTimeControl.value);
      const end = this.combineDateAndTime(this.endDateControl.value, this.endTimeControl.value);

      if (start && end && start < end) {
        return { start, end };
      }
    }
    return null;
  }

}