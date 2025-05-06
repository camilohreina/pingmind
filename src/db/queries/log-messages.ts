import { and, db, eq } from "..";
import { logMessages } from "../schema/log-messages";

type newLogMessage = typeof logMessages.$inferInsert;

export const createLogMessage = (logMessage: newLogMessage) => {
  return db.insert(logMessages).values(logMessage).execute();
};

export const getLogMessage = (messageId: string) => {
  return db.query.logMessages.findFirst({
    where: eq(logMessages.message_id, messageId),
  });
};

export const getLogMessagesContext = (userId: string) => {
  return db.query.logMessages.findMany({
    where: and(
      eq(logMessages.user_id, userId),
      eq(logMessages.used_context, false),
    ),
    orderBy: (logMessages, { desc }) => [desc(logMessages.created_at)],
  });
};
