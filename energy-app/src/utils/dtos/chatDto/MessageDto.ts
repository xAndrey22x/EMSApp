export interface MessageDto {
    senderId: number;
    receiverId: number;
    message: string;
    announcerName?: string;
    seen: boolean;
}