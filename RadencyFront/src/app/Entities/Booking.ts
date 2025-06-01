export interface Booking{
  id: number;
  userId: string;
  userEmail: string;
  workspaceUnitId: number;
  workspaceType: string;
  workspaceCapacity: number;
  coworkingName: string;
  startTimeLOC: string;  
  endTimeLOC: string;
  timeZoneId: string;
}
