import { UserRefDto } from "./UserRefDto";

export interface DeviceDto {
    id?: number;
    description: string;
    address: string;
    mhec: number;
    userRef?: UserRefDto | null;
}