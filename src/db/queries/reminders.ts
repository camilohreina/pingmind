import { and, db, eq } from "..";
import { reminders,  } from "../schema/reminders"


type newReminder = typeof reminders.$inferInsert;


export const createReminder = (reminder: newReminder) => {
    return db.insert(reminders).values(reminder).execute();
}

export const getReminderSame = ({
    text, 
    scheduledAt,
    userId,
    status
}:{
    text: string,
    scheduledAt: Date,
    userId: string,
    status: typeof reminders.status.enumValues[number]
}) => {
   return  db.query.reminders.findFirst({
        where: and(
            eq(reminders.text, text),
            eq(reminders.scheduledAt, scheduledAt),
            eq(reminders.userId, userId),
            eq(reminders.status, status)
        )
    })
}