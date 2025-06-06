export interface CreateBooking {
  name: string;
  email: string;
  workspaceUnitId: number;
  startTimeLOC: string;
  endTimeLOC: string;
  timeZoneId:string;
}
