import { and, db, eq, gte, lte, users } from "..";
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
  const user  = await getUserByPhone(phone);
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
  status,
}: {
  id: string;
  text: string;
  scheduledAt: Date;
  status: (typeof reminders.status.enumValues)[number];
}) => {
  try {
    console.log("DB: Actualizando recordatorio", { id, text, scheduledAt, status });
    
    // Verificar primero si el recordatorio existe
    const existingReminder = await db.query.reminders.findFirst({
      where: eq(reminders.id, id),
    });
    
    if (!existingReminder) {
      console.log("DB: Recordatorio no encontrado con ID:", id);
      return null;
    }
    
    const result = await db
      .update(reminders)
      .set({ text, scheduledAt, status })
      .where(eq(reminders.id, id))
      .execute();
      
    console.log("DB: Resultado de actualización:", result);
    return result;
  } catch (error) {
    console.error("DB: Error al actualizar recordatorio:", error);
    throw error;
  }
};
