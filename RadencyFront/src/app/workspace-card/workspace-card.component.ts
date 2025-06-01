import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkspacesByType } from '../Entities/WorkspacesByType';
import { WorkspacesTypes } from '../Entities/WorkspacesTypes';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workspace-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './workspace-card.component.html',
  styleUrl: './workspace-card.component.scss'
})
export class WorkspaceCardComponent {
  @Input() workspace!: WorkspacesByType;
  @Output() bookNow = new EventEmitter<WorkspacesByType>();


  workspaceTypes = WorkspacesTypes;

  getWorkspaceType_Icon(type: string): string {
    if (type === WorkspacesTypes.OpenSpace) {
      return 'desktop_mac';
    }
    else if (type === WorkspacesTypes.PrivateRoom) {
      return 'meeting_room';
    }
    else if (type === WorkspacesTypes.MeetingRoom) {
      return 'groups';
    }
    else {
      return 'business';
    }

  }

  getWorkspaceTitleByType(type: string): string {


    if (type === WorkspacesTypes.OpenSpace) {
      return 'Open Space';
    }
    else if (type === WorkspacesTypes.PrivateRoom) {
      return 'Private Room';
    }
    else if (type === WorkspacesTypes.MeetingRoom) {
      return 'Meeting Room';
    }
    else {
      return type;
    }

  }

  getAvailableCount(): number {
    return this.workspace.units.filter(unit => unit.isAvailable).length;
  }

  getCurrentBookingCount(): number {
    return this.workspace.units.filter(unit => unit.hasCurrentBooking).length;
  }

  getCapacityOptions(): string {
    const capacities = [...new Set(this.workspace.units.map(unit => unit.capacity))].sort((a, b) => a - b);
    return capacities.join(', ') + ' people';
  }

  onBookNow(): void {
    this.bookNow.emit(this.workspace);
  }


}
