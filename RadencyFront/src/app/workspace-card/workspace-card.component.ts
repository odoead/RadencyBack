import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WorkspacesByType } from '../Shared/Entities/WorkspacesByType';
import { WorkspacesTypes } from '../Shared/Entities/WorkspacesTypes';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AmenitiesListComponent } from "../amenities-list/amenities-list.component";
import { Amenity } from '../Shared/Entities/Amenity';

@Component({
  selector: 'app-workspace-card',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatButtonModule, MatIconModule, AmenitiesListComponent],
  templateUrl: './workspace-card.component.html',
  styleUrl: './workspace-card.component.scss'
})
export class WorkspaceCardComponent {
  @Input() workspace!: WorkspacesByType;
  @Output() bookNow = new EventEmitter<WorkspacesByType>();
  @Input() amenities!: Amenity[];

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


    if (type.toLocaleLowerCase() === WorkspacesTypes.OpenSpace.toLocaleLowerCase()) {
      return 'Open Space';
    }
    else if (type.toLocaleLowerCase() === WorkspacesTypes.PrivateRoom.toLocaleLowerCase()) {
      return 'Private Room';
    }
    else if (type.toLocaleLowerCase() === WorkspacesTypes.MeetingRoom.toLocaleLowerCase()) {
      return 'Meeting Room';
    }
    else {
      return type;
    }

  }

  getAvailableCount(): number {
    return this.workspace.units.filter(unit => unit.isAvailable).length;
  }


  getCapacityOptions(): string {
    const capacities = [...new Set(this.workspace.units.map(unit => unit.capacity))].sort((a, b) => a - b);
    return capacities.join(', ') + ' people';
  }

  onBookNow(): void {
    this.bookNow.emit(this.workspace);
  }


}
