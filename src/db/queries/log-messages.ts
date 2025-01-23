import { db, eq } from "..";
import { logMessages } from "../schema/log-messages";

type newLogMessage = typeof logMessages.$inferInsert;


export const createLogMessage = (logMessage: newLogMessage) => {
    return db.insert(logMessages).values(logMessage).execute();
}

export const getLogMessage = (messageId: string) => {
    return db.query.logMessages.findFirst({
        where: eq(logMessages.messageId, messageId)
    })
}