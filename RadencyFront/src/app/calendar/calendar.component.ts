import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
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
import { CoworkingService } from '../Shared/Services/coworking.service';
import { BehaviorSubject, catchError, combineLatest, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, Subject, switchMap, takeUntil, tap, timeout } from 'rxjs';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() workspaceType: WorkspacesTypes | null = null;
  @Input() selectedRange: DateTimeRange | null = null;
  @Input() unavailableRanges: DateTimeRange[] = [];
  @Input() workspaceUnitId: number | null = null;

  @Output() rangeChange = new EventEmitter<DateTimeRange | null>();
  @Output() validationChange = new EventEmitter<boolean>();

  public isChecking = false;
  public hasOverlap = false;

  startDateControl = new FormControl<Date | null>(null, Validators.required);
  startTimeControl = new FormControl<string | null>(null, [
    Validators.required,
    this.pastTimeValidator.bind(this),
  ]);
  endDateControl = new FormControl<Date | null>(null, Validators.required);
  endTimeControl = new FormControl<string | null>(null, [
    Validators.required,
    this.endTimeValidator.bind(this),
  ]);

  minDate = new Date().setHours(0, 0, 0, 0);
  maxEndDate: Date | null = null;

  constructor(private coworkingService: CoworkingService) { }

  ngOnInit(): void {
    // initialize from @Input() if provided
    if (this.selectedRange) {
      this.initFromSelectedRange();
    }
    this.updateMaxEndDateConstraint();

    // single combined stream for all four controls
    combineLatest([
      this.startDateControl.valueChanges,
      this.startTimeControl.valueChanges,
      this.endDateControl.valueChanges,
      this.endTimeControl.valueChanges,
    ])
      .pipe(
        debounceTime(400), // wait for user to pause typing
        map(() => this.createDateTimeRangeFromControls()),
        distinctUntilChanged((a, b) =>
          !!a && !!b
            ? a.start.getTime() === b.start.getTime() && a.end.getTime() === b.end.getTime()
            : a === b
        ),
        switchMap((range) => {
          // if invalid, skip server check
          if (!range || !this.workspaceUnitId) {
            return of({ overlap: false, range });
          }
          return this.coworkingService
            .isLOCTimeRangeAvaliable({
              startTimeLOC: this.formatDateWithoutTimezone(range.start),
              endTimeLOC: this.formatDateWithoutTimezone(range.end),
              workspaceUnitId: this.workspaceUnitId,
            })
            .pipe(
              map((isAvailable) => ({ overlap: !isAvailable, range })),
              catchError(() => of({ overlap: true, range }))
            );
        })
      )
      .subscribe(({ overlap, range }) => {
        const allValidLocally =
          this.startDateControl.valid &&
          this.startTimeControl.valid &&
          this.endDateControl.valid &&
          this.endTimeControl.valid &&
          !!range;
        const exceedsDuration = range ? this.isDurationExceeded(range) : false;
        const overallValid = allValidLocally && !overlap && !exceedsDuration;
        console.log('Calendar emits range:', range, 'valid?', !overlap && !!range && !this.isDurationExceeded(range));

        this.validationChange.emit(overallValid);
        this.rangeChange.emit(overallValid ? range : null);
      });

    // also react to external @Input() changes
    this.updateMaxEndDateConstraint();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedRange'] && this.selectedRange) {
      this.initFromSelectedRange();
    }
    if (changes['workspaceType']) {
      this.updateMaxEndDateConstraint();
    }
  }

  private initFromSelectedRange(): void {
    const { start, end } = this.selectedRange!;
    this.startDateControl.setValue(start ? new Date(start) : null);
    this.startTimeControl.setValue(start ? this.formatTimeForInput(new Date(start)) : null);
    this.endDateControl.setValue(end ? new Date(end) : null);
    this.endTimeControl.setValue(end ? this.formatTimeForInput(new Date(end)) : null);
    this.updateMaxEndDateConstraint();
  }

  private pastTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || !this.startDateControl.value) return null;
    const selectedDate = new Date(this.startDateControl.value);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const candidate = this.combineDateAndTime(this.startDateControl.value, control.value);
      if (candidate <= now) {
        return { pastTime: true };
      }
    }
    return null;
  }

  private endTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (
      !control.value ||
      !this.endDateControl.value ||
      !this.startDateControl.value ||
      !this.startTimeControl.value
    ) {
      return null;
    }
    const range = this.createDateTimeRangeFromControls();
    if (!range || range.end <= range.start) {
      return { invalidEndTime: true };
    }
    return null;
  }

  createDateTimeRangeFromControls(): DateTimeRange | null {
    if (
      this.startDateControl.value &&
      this.startTimeControl.value &&
      this.endDateControl.value &&
      this.endTimeControl.value &&
      this.startDateControl.valid &&
      this.startTimeControl.valid &&
      this.endDateControl.valid &&
      this.endTimeControl.valid
    ) {
      const start = this.combineDateAndTime(
        this.startDateControl.value,
        this.startTimeControl.value
      );
      const end = this.combineDateAndTime(
        this.endDateControl.value,
        this.endTimeControl.value
      );
      if (start < end) {
        return { start, end };
      }
    }
    return null;
  }

  private combineDateAndTime(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number);
    const dt = new Date(date);
    dt.setHours(h, m, 0, 0);
    return dt;
  }

  private formatTimeForInput(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }

  private formatDateWithoutTimezone(date: Date): string {
    const YYYY = date.getFullYear();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const DD = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${ms}`;
  }

  private updateMaxEndDateConstraint(): void {
    if (this.startDateControl.value && this.workspaceType !== null) {
      const maxDays = this.getMaxDurationDays();
      const d = new Date(this.startDateControl.value);
      d.setDate(d.getDate() + maxDays);

      // for MeetingRoom only same-day
      this.maxEndDate =
        this.workspaceType === WorkspacesTypes.MeetingRoom ? new Date(this.startDateControl.value) : d;

      // clamp end date if out of bounds
      if (this.endDateControl.value && this.maxEndDate && this.endDateControl.value > this.maxEndDate) {
        this.endDateControl.setValue(this.maxEndDate);
      }
    } else {
      this.maxEndDate = null;
    }
  }

  getMaxDurationDays(): number {
    switch (this.workspaceType) {
      case WorkspacesTypes.MeetingRoom:
        return 1;
      case WorkspacesTypes.OpenSpace:
        return 30;
      case WorkspacesTypes.PrivateRoom:
        return 30;
      default:
        return 30;
    }
  }

  isDurationExceeded(range: DateTimeRange): boolean {
    const ms = range.end.getTime() - range.start.getTime();
    const maxMs = this.getMaxDurationDays() * 24 * 60 * 60 * 1000;
    // MeetingRoom special: no >24h
    if (this.workspaceType === WorkspacesTypes.MeetingRoom && ms > 24 * 60 * 60 * 1000) {
      return true;
    }
    return ms > maxMs;
  }

  getMinStartTime(): string | null {
    if (!this.startDateControl.value) return null;
    const sd = new Date(this.startDateControl.value);
    sd.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (sd.getTime() === today.getTime()) {
      return this.formatTimeForInput(new Date());
    }
    return '00:00';
  }

  getMaxDurationText(): string {
    const days = this.getMaxDurationDays();
    return days === 1 ? '24 hours' : `${days} days`;
  }

  formatDuration(range: DateTimeRange | null = this.createDateTimeRangeFromControls()): string {
    if (!range) return 'N/A';
    const ms = range.end.getTime() - range.start.getTime();
    if (ms <= 0) return 'Invalid duration';
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const parts = [];
    if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (mins) parts.push(`${mins} minute${mins > 1 ? 's' : ''}`);
    return parts.join(', ') || '0 minutes';
  }

  getQuickDurations(): { label: string; hours: number }[] {
    if (!this.workspaceType) return [];
    const base = [
      { label: '1 hour', hours: 1 },
      { label: '2 hours', hours: 2 },
      { label: '4 hours', hours: 4 },
    ];
    if (this.workspaceType === WorkspacesTypes.MeetingRoom) {
      base.push({ label: 'Full Day (8h)', hours: 8 });
    } else {
      base.push(
        { label: '8 hours', hours: 8 },
        { label: '1 day (24h)', hours: 24 },
        { label: '3 days', hours: 72 },
        { label: '1 week', hours: 168 }
      );
    }
    const maxH = this.getMaxDurationDays() * 24;
    return base.filter((d) => d.hours <= maxH);
  }

  setQuickDuration(dur: { label: string; hours: number }): void {
    if (!this.startDateControl.value || !this.startTimeControl.value) {
      return;
    }
    const start = this.combineDateAndTime(this.startDateControl.value, this.startTimeControl.value);
    const end = new Date(start.getTime() + dur.hours * 60 * 60 * 1000);
    const capped = this.maxEndDate
      ? new Date(Math.min(end.getTime(), this.combineDateAndTime(this.maxEndDate, this.formatTimeForInput(end)).getTime()))
      : end;

    this.endDateControl.setValue(capped);
    this.endTimeControl.setValue(this.formatTimeForInput(capped));
  }

  get timezoneName(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}