import { BookableWorkspaceUnit } from "./BookableWorkspaceUnit";


export interface WorkspacesByType {
    type: string;
    units: BookableWorkspaceUnit[];
}
