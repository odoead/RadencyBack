import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { WorkspacesTypes } from '../Entities/WorkspacesTypes';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateTimeRange } from '../Entities/DateTimeRange';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
    MatDatepickerModule,
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

  startDateControl = new FormControl<Date | null>(null, [Validators.required]);
  startTimeControl = new FormControl<string>('', [Validators.required]);
  endDateControl = new FormControl<Date | null>(null, [Validators.required]);
  endTimeControl = new FormControl<string>('', [Validators.required]);

  minDate = new Date();
  maxEndDate: Date | null = null;

  ngOnInit(): void {
    this.setupValidators();
    this.subscribeToChanges();
    this.initFromSelectedRange();
    this.updateMaxEndDate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedRange'] && !changes['selectedRange'].firstChange) {
      this.initFromSelectedRange();
    }
    if (changes['workspaceType']) {
      this.updateMaxEndDate();
    }
  }

  get timezoneName(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private subscribeToChanges(): void {
    // Update end date constraints when start date changes
    this.startDateControl.valueChanges.subscribe(() => {
      this.startTimeControl.updateValueAndValidity();
      this.endTimeControl.updateValueAndValidity();
      this.updateMaxEndDate();
      this.validateFormEmit();
    });
    this.startTimeControl.valueChanges.subscribe(() => {
      this.endTimeControl.updateValueAndValidity();
      this.validateFormEmit();
    });

    // emit overall validity/range whenever any control changes
    [
      this.startDateControl,
      this.startTimeControl,
      this.endDateControl,
      this.endTimeControl,
    ].forEach((ctrl: AbstractControl) => {
      ctrl.valueChanges.subscribe(() => this.validateFormEmit());
    });
  }

  private setupValidators(): void {
    this.startTimeControl.addValidators(this.pastTimeValidator.bind(this));
    this.endTimeControl.addValidators(this.endTimeValidator.bind(this));
    this.endTimeControl.addValidators(this.overlapValidator.bind(this));

  }

  private overlapValidator = (): ValidationErrors | null => {
    const range = this.createDateTimeRange();
    if (!range) return null;
    if (this.isOverlapping(range)) {
      return { overlap: true };
    }
    return null;
  };

  private isOverlapping(range: DateTimeRange): boolean {
    return this.unavailableRanges.some(
      (unavailable) =>
        range.start < unavailable.end && range.end > unavailable.start
    );
  }

  isCurrentRangeUnavailable(): boolean {
    const range = this.createDateTimeRange();
    return !!range && this.isOverlapping(range);
  }

  private initFromSelectedRange(): void {
    if (!this.selectedRange) {
      this.startDateControl.reset();
      this.startTimeControl.reset();
      this.endDateControl.reset();
      this.endTimeControl.reset();
      return;
    }
    const { start, end } = this.selectedRange;
    this.startDateControl.setValue(start);
    this.startTimeControl.setValue(this.formatTimeForInput(start));
    this.endDateControl.setValue(end);
    this.endTimeControl.setValue(this.formatTimeForInput(end));
  }

  getMaxDurationDays(): number {
    switch (this.workspaceType) {
      case WorkspacesTypes.MeetingRoom:
        return 1;
      case WorkspacesTypes.OpenSpace:
      case WorkspacesTypes.PrivateRoom:
        return 30;
      default:
        return 1;
    }
  }

  private updateMaxEndDate(): void {
    if (this.startDateControl.value && this.workspaceType) {
      const maxDays = this.getMaxDurationDays();
      this.maxEndDate = new Date(this.startDateControl.value);
      this.maxEndDate.setDate(this.maxEndDate.getDate() + maxDays);
    }
  }

  private validateFormEmit(): void {
    const isValid =
      this.startDateControl.valid &&
      this.startTimeControl.valid &&
      this.endDateControl.valid &&
      this.endTimeControl.valid &&
      !this.isDurationExceeded();

    this.validationChange.emit(isValid);

    if (isValid) {
      const range = this.createDateTimeRange();
      this.rangeChange.emit(range);
    } else {
      this.rangeChange.emit(null);
    }
  }

  private pastTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.startDateControl?.value) return null;
    const selectedDate = this.startDateControl.value;
    const selectedTime = control.value;
    const now = new Date();

    if (this.isSameDate(selectedDate, now)) {
      const selectedDateTime = this.combineDateAndTime(
        selectedDate,
        selectedTime
      );
      if (selectedDateTime <= now) {
        return { pastTime: true };
      }
    }

    return null;
  }

  private endTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (
      !control.value ||
      !this.startDateControl?.value ||
      !this.startTimeControl?.value ||
      !this.endDateControl?.value
    ) {
      return null;
    }

    const startDateTime = this.combineDateAndTime(
      this.startDateControl.value,
      this.startTimeControl.value
    );
    const endDateTime = this.combineDateAndTime(
      this.endDateControl.value,
      control.value
    );

    if (endDateTime <= startDateTime) {
      return { invalidEndTime: true };
    }

    return null;
  }

  private createDateTimeRange(): DateTimeRange | null {
    if (
      !this.startDateControl.value ||
      !this.startTimeControl.value ||
      !this.endDateControl.value ||
      !this.endTimeControl.value
    ) {
      return null;
    }

    return {
      start: this.combineDateAndTime(
        this.startDateControl.value,
        this.startTimeControl.value
      ),
      end: this.combineDateAndTime(
        this.endDateControl.value,
        this.endTimeControl.value
      ),
    };
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  getMinTime(): string {
    if (!this.startDateControl.value) {
      return '';
    }
    const now = new Date();
    if (this.isSameDate(this.startDateControl.value, now)) {
      const mins = now.getMinutes();
      const rounded = Math.ceil(mins / 15) * 15;
      now.setMinutes(rounded, 0, 0);
      return this.formatTimeForInput(now);
    }
    return '';
  }

  getMaxDurationText(): string {
    if (!this.workspaceType) return '';

    const days = this.getMaxDurationDays();
    return days === 1 ? '1 day' : `${days} days`;
  }

  isDurationExceeded(): boolean {
    const range = this.createDateTimeRange();
    if (!range || !this.workspaceType) return false;

    const durationMs = range.end.getTime() - range.start.getTime();
    const maxDurationMs = this.getMaxDurationDays() * 24 * 60 * 60 * 1000;

    return durationMs > maxDurationMs;
  }

  formatDuration(range: DateTimeRange): string {
    const durationMs = range.end.getTime() - range.start.getTime();
    const days = Math.floor(durationMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (durationMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(', ') || '0 minutes';
  }

  getQuickDurations(): { label: string; hours: number }[] {
    if (!this.workspaceType) return [];

    const baseOptions = [
      { label: '2 hours', hours: 2 },
      { label: '4 hours', hours: 4 },
      { label: '8 hours', hours: 8 },
    ];

    if (this.workspaceType !== WorkspacesTypes.MeetingRoom) {
      baseOptions.push(
        { label: '1 day', hours: 24 },
        { label: '3 days', hours: 72 },
        { label: '1 week', hours: 168 }
      );
    }

    return baseOptions;
  }

  setQuickDuration(duration: { label: string; hours: number }): void {
    if (!this.startDateControl.value || !this.startTimeControl.value) return;

    const startDateTime = this.combineDateAndTime(
      this.startDateControl.value,
      this.startTimeControl.value
    );
    const endDateTime = new Date(
      startDateTime.getTime() + duration.hours * 60 * 60 * 1000
    );

    this.endDateControl.setValue(endDateTime);
    this.endTimeControl.setValue(this.formatTimeForInput(endDateTime));
  }
}
