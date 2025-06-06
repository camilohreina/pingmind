import { and, db, eq, gte, lte, sql, users } from "..";
import { reminders } from "../schema/reminders";
import { getUserByPhone } from "./users";

export type newReminder = typeof reminders.$inferInsert;

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
  utcNow.setSeconds(0, 0);
  const utcAfter = new Date(utcNow.getTime() + 60000);
  utcAfter.setSeconds(0, 0);
  return db
    .select({
      reminder: reminders,
      phone: users.phone,
    })
    .from(reminders)
    .innerJoin(users, eq(reminders.userId, users.id))
    .where(
      and(
        lte(reminders.scheduledAt, utcAfter),
        gte(reminders.scheduledAt, utcNow),
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

export const getPendingRemindersByUser = (userId: string) => {
  return db.query.reminders.findMany({
    where: and(
      eq(reminders.userId, userId),
      eq(reminders.status, "PENDING"),
      gte(reminders.scheduledAt, new Date()),
    ),
  });
};

export const getPendingRemindersByPhone = async (phone: string) => {
  const user = await getUserByPhone(phone);
  if (!user) {
    return [];
  }
  const userId = user.id;
  return db.query.reminders.findMany({
    where: and(
      eq(reminders.userId, userId),
      eq(reminders.status, "PENDING"),
      gte(reminders.scheduledAt, new Date()),
    ),
  });
};

export const updateReminder = async ({
  id,
  text,
  scheduledAt,
  localDate,
  status,
}: {
  id: string;
  text: string;
  scheduledAt: Date;
  localDate: Date;
  status: (typeof reminders.status.enumValues)[number];
}) => {
  try {
    const existingReminder = await db.query.reminders.findFirst({
      where: eq(reminders.id, id),
    });

    if (!existingReminder) {
      console.log("DB: Recordatorio no encontrado con ID:", id);
      return null;
    }

    const result = await db
      .update(reminders)
      .set({ text, scheduledAt, localDate, status })
      .where(eq(reminders.id, id))
      .execute();

    return result;
  } catch (error) {
    console.error("DB: Error al actualizar recordatorio:", error);
    throw error;
  }
};

export const getCompletedRemindersByUser = ({
  userId,
  startDate,
  endDate,
}: {
  userId: string;
  startDate: Date;
  endDate: Date;
}) => {
  return db
    .select({ count: sql<number>`count(*)`.as("count") })
    .from(reminders)
    .where(
      and(
        eq(reminders.userId, userId),
        eq(reminders.status, "COMPLETED"),
        gte(reminders.scheduledAt, startDate),
        lte(reminders.scheduledAt, endDate),
      ),
    );
};
