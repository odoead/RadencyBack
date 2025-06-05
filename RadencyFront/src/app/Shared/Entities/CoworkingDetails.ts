import { Amenity } from "./Amenity";
import { WorkspacesByType } from "./WorkspacesByType";


export interface CoworkingDetails {
    id: number;
    name: string;
    address: string;
    workspaceTypes: WorkspacesByType[];
    amenities: Amenity[];
    photoUrls: string[];
}
