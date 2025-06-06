import { WorkspacesTypes } from "./WorkspacesTypes";

export interface BookingFormData {
  name: string;
  email: string;
  workspaceType: WorkspacesTypes;
  selectedUnits: number[];
  startDateTime: Date;
  endDateTime: Date;
}