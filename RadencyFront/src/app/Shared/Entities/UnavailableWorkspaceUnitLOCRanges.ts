import { DateTimeRange } from "./DateTimeRange";

export interface UnavailableWorkspaceUnitLOCRanges {
    workspaceUnitId: number;
    unavailableRanges: DateTimeRange[];
}