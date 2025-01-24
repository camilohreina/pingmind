import { and, db, eq, gte, lte, users } from "..";
import { reminders } from "../schema/reminders";

type newReminder = typeof reminders.$inferInsert;

export const createReminder = (reminder: newReminder) => {
  return db.insert(reminders).values(reminder).execute();
};

export const getReminderSame = ({
  text,
  scheduledAt,
  userId,
  status,
}: {
  text: string;
  scheduledAt: Date;
  userId: string;
  status: (typeof reminders.status.enumValues)[number];
}) => {
  return db.query.reminders.findFirst({
    where: and(
      eq(reminders.text, text),
      eq(reminders.scheduledAt, scheduledAt),
      eq(reminders.userId, userId),
      eq(reminders.status, status),
    ),
  });
};

export const getReminderLastMinute = () => {
  const now = new Date();
  const utcNow = new Date(now.toUTCString());

  return db
    .select({
        reminder: reminders,
        phone: users.phone,
    })
    .from(reminders)
    .innerJoin(users, eq(reminders.userId, users.id))
    .where(
      and(
        lte(reminders.scheduledAt, utcNow),
        gte(reminders.scheduledAt, new Date(utcNow.getTime() - 60000)),
        eq(reminders.status, "PENDING"),
      ),
    );
};

export const updateStatusReminder = ({
  id,
  status,
}: {
  id: string;
  status: (typeof reminders.status.enumValues)[number];
}) => {
  return db
    .update(reminders)
    .set({ status })
    .where(eq(reminders.id, id))
    .execute();
};
