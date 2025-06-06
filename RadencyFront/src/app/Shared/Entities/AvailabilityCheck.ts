export interface AvailabilityCheck  {
  workspaceUnitId: number;
  startTimeLOC: string;
  endTimeLOC: string;
  excludeBookingId?: number;  
}
