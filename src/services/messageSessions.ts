import { IMessageSession, Session } from "../types/services";

let waitMessageSessions: IMessageSession[] = [];

export function pushSession(userId: number, type: Session, details?: any) {
    const session: IMessageSession = { userId, type };
    if (details) {
        session.details = details;
    }
    waitMessageSessions.push(session);
}

export function deleteSession(userId: number) {
    waitMessageSessions = waitMessageSessions.filter((sess) => sess.userId !== userId);
}

export function validateSession(userId: number, type: Session): IMessageSession {
    return waitMessageSessions.find((sess) => sess.userId === userId && sess.type === type);
}

export function getSession(userId: number): IMessageSession {
    return waitMessageSessions.find((sess) => sess.userId === userId);
}
