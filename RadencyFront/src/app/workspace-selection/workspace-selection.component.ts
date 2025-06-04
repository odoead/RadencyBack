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
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';

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
  @Input() selectedUnit: number | null = null;
  @Output() workspaceTypeChange = new EventEmitter<WorkspacesTypes | null>();
  @Output() unitChange = new EventEmitter<number | null>();

  workspaceTypeControl = new FormControl<WorkspacesTypes | null>(null);
  filteredUnits: BookableWorkspaceUnit[] = [];
  availableTypes: WorkspacesByType[] = [];

  readonly workspaceTypesEnum = WorkspacesTypes;

  ngOnInit(): void {
    this.updateAvailableTypes();
    if (this.selectedWorkspaceType) {
      this.workspaceTypeControl.setValue(this.selectedWorkspaceType, { emitEvent: false });
    }
    this.updateFilteredUnits();

    this.workspaceTypeControl.valueChanges.subscribe(type => {
      this.workspaceTypeChange.emit(type);
      this.unitChange.emit(null);
      this.selectedUnit = null;
      this.updateFilteredUnits();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workspaceTypes']) {
      this.updateAvailableTypes();
      // If selectedWorkspaceType was already set, re-filtering might be needed
      this.updateFilteredUnits();
    }
    if (changes['selectedWorkspaceType']) {
      if (this.workspaceTypeControl.value !== this.selectedWorkspaceType) {
        this.workspaceTypeControl.setValue(this.selectedWorkspaceType, { emitEvent: false });
      }
      this.updateFilteredUnits();
    }

  }

  updateAvailableTypes(): void {
    this.availableTypes = this.workspaceTypes.filter(type =>
      type.units && type.units.some(unit => unit.isAvailable)
    );
  }

  updateFilteredUnits(): void {
    const currentType = this.workspaceTypeControl.value;
    if (currentType) {
      // Search for object whose type == selected type
      // if found then filter units by isAvailable
      const typeData = this.workspaceTypes.find(q => q.type === currentType);
      this.filteredUnits = typeData ? typeData.units.filter(u => u.isAvailable) : []; // Only show available units
    } else {
      this.filteredUnits = [];
    }
  }



  /*toggleUnit(unit: BookableWorkspaceUnit): void {
    if (!unit.isAvailable) return;

    const newSelection = [...this.selectedUnits];
    const index = newSelection.indexOf(unit.id);

    if (index > -1) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(unit.id);
    }
    this.unitChange.emit(newSelection);
  }*/

  onCheckboxChange(unit: BookableWorkspaceUnit, event: any): void {
    event.stopPropagation();
    this.selectUnit(unit);
  }

  selectUnit(unit: BookableWorkspaceUnit): void {
    if (!unit.isAvailable) return;

    if (this.selectedUnit === unit.id) {
      this.unitChange.emit(null);
      this.selectedUnit = null;
    } else {
      this.unitChange.emit(unit.id);
      this.selectedUnit = unit.id;
    }
  }

  removeUnit(): void {
    if (this.selectedUnit !== null) {
      this.selectedUnit = null;
      this.unitChange.emit(null);
    }
  }

  isUnitSelected(unitId: number): boolean {
    return this.selectedUnit === unitId;
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
    return type.units ? type.units.filter(unit => unit.isAvailable).length : 0;
  }

  getStatusText(unit: BookableWorkspaceUnit): string {
    if (!unit.isAvailable) return 'Unavailable';
    if (unit.hasCurrentBooking) return 'Your booking';
    if (this.selectedUnit === unit.id) return 'Selected';
    return 'Available';
  }

  getStatusClass(unit: BookableWorkspaceUnit): string {
    if (!unit.isAvailable) return 'unavailable';
    if (unit.hasCurrentBooking) return 'current-booking';
    if (this.selectedUnit === unit.id) return 'selected';
    return 'available';
  }

}
