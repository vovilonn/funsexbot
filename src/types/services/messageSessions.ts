export type Session = "photoDescription" | "sendMessage";

export interface IMessageSession {
    userId: number;
    type: Session;
    details?: any;
}
