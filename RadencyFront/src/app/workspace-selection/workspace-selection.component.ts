import { Component, EventEmitter, Input, input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { WorkspacesByType } from '../Entities/WorkspacesByType';
import { WorkspacesTypes } from '../Entities/WorkspacesTypes';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BookableWorkspaceUnit } from '../Entities/BookableWorkspaceUnit';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-workspace-selection',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPseudoCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule, MatCheckboxModule],
  templateUrl: './workspace-selection.component.html',
  styleUrl: './workspace-selection.component.scss'
})
export class WorkspaceSelectionComponent implements OnInit, OnChanges {
  @Input() workspaceTypes: WorkspacesByType[] = [];
  @Input() selectedWorkspaceType: WorkspacesTypes | null = null;
  @Input() selectedUnits: number[] = [];
  @Output() workspaceTypeChange = new EventEmitter<WorkspacesTypes>();
  @Output() unitsChange = new EventEmitter<number[]>();

  workspaceTypeControl = new FormControl<WorkspacesTypes | null>(null);
  filteredUnits: BookableWorkspaceUnit[] = [];
  availableTypes: WorkspacesByType[] = [];

  readonly workspaceTypesEnum = WorkspacesTypes;

  ngOnInit(): void {
    this.updateAvailableTypes();
    this.workspaceTypeControl.setValue(this.selectedWorkspaceType);
    this.updateFilteredUnits();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspaceTypes']) {
      this.updateAvailableTypes();
      this.updateFilteredUnits();
    }
    if (changes['selectedWorkspaceType']) {
      this.workspaceTypeControl.setValue(this.selectedWorkspaceType);
      this.updateFilteredUnits();
    }
  }

  updateAvailableTypes(): void {
    this.availableTypes = this.workspaceTypes.filter(type =>
      type.units.some(unit => unit.isAvailable)
    );
  }

  updateFilteredUnits(): void {
    if (this.selectedWorkspaceType) {
      const selectedType = this.workspaceTypes.find(type => type.type === this.selectedWorkspaceType);
      this.filteredUnits = selectedType ? selectedType.units : [];
    } else {
      this.filteredUnits = [];
    }
  }



  onWorkspaceTypeChange(): void {
    const chosenType = this.workspaceTypeControl.value;
    if (chosenType) {
      this.workspaceTypeChange.emit(chosenType);
      this.unitsChange.emit([]);
    }
  }

  toggleUnit(unit: BookableWorkspaceUnit): void {
    if (!unit.isAvailable) return;

    const newSelection = [...this.selectedUnits];
    const index = newSelection.indexOf(unit.id);

    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(unit.id);
    }
    this.unitsChange.emit(newSelection);
  }

  onCheckboxChange(unit: BookableWorkspaceUnit, event: any): void {
    event.stopPropagation();
    this.toggleUnit(unit);
  }

  removeUnit(unitId: number): void {
    const newSelection = this.selectedUnits.filter(id => id !== unitId);
    this.unitsChange.emit(newSelection);
  }

  isUnitSelected(unitId: number): boolean {
    return this.selectedUnits.includes(unitId);
  }

  getWorkspaceIcon(type: string): string {
    switch (type) {
      case WorkspacesTypes.OpenSpace:
        return 'desktop_mac';
      case WorkspacesTypes.PrivateRoom:
        return 'meeting_room';
      case WorkspacesTypes.MeetingRoom:
        return 'groups';
      default:
        return 'business';
    }
  }

  getWorkspaceTitle(type: string): string {
    switch (type) {
      case WorkspacesTypes.OpenSpace:
        return 'Open Space';
      case WorkspacesTypes.PrivateRoom:
        return 'Private Room';
      case WorkspacesTypes.MeetingRoom:
        return 'Meeting Room';
      default:
        return type;
    }
  }
  getAvailableCount(type: WorkspacesByType): number {
    return type.units.filter(unit => unit.isAvailable).length;
  }

  getStatusText(unit: BookableWorkspaceUnit): string {
    if (!unit.isAvailable) return 'Unavailable';
    if (unit.hasCurrentBooking) return 'Your booking';
    return 'Available';
  }

  getStatusClass(unit: BookableWorkspaceUnit): string {
    if (!unit.isAvailable) return 'unavailable';
    if (unit.hasCurrentBooking) return 'current-booking';
    return 'available';
  }

}
