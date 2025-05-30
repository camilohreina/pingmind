import { reminders } from "@/db";
import {
  createReminder,
  getPendingRemindersByPhone,
  getReminderLastMinute,
  updateReminder,
  updateStatusReminder,
} from "@/db/queries/reminders";
import { getUserByPhone } from "@/db/queries/users";
import { sendReplyReminder } from "@/lib/infobip";

type ReminderUser = {
  localDate: string;
  reminderDate: string;
  response: string;
  alert: string;
  message: string;
};

export const sendAlertReminder = async () => {
  try {
    const currentReminders = await getReminderLastMinute();
    if (currentReminders.length === 0) {
      return { status: "success", ok: true };
    }

    for (const reminder of currentReminders) {
      await sendReplyReminder({
        phone: reminder.phone,
        message: reminder.reminder.alert || "Recordatorio",
      });
      await updateStatusReminder({
        id: reminder.reminder.id,
        status: "COMPLETED",
      });
    }
  } catch (error) {
    return { status: "error", error: "internal_server_error", ok: false };
  }
};

export const addNewReminder = async ({
  phone,
  reminder_user,
}: {
  phone: string;
  reminder_user: ReminderUser;
}) => {
  try {
    const user = await getUserByPhone(phone);

    if (!user) {
      return { status: "error", error: "user_not_found", ok: false };
    }

    // Convertir la fecha UTC a fecha local usando el timezone del usuario
    const localDate = new Date(reminder_user.localDate);
    const scheduledAt = new Date(reminder_user.reminderDate);

    const reminder = await createReminder({
      id: crypto.randomUUID(),
      userId: user.id,
      text: reminder_user.message,
      scheduledAt: scheduledAt,
      status: "PENDING",
      response: reminder_user.response,
      alert: reminder_user.alert,
      localDate: localDate, // Guardamos explícitamente la fecha local
    });

    return { status: "success", ok: true, reminder };
  } catch (error) {
    console.error("Error creating reminder:", error);
    return { status: "error", error: "internal_server_error", ok: false };
  }
};

export const updatePendingReminder = async ({
  reminderId,
  reminder_user,
}: {
  reminderId: string;
  reminder_user: ReminderUser;
}) => {
  const localDate = new Date(reminder_user.localDate);
  const scheduledAt = new Date(reminder_user.reminderDate);

  const response = await updateReminder({
    id: reminderId,
    text: reminder_user.message,
    scheduledAt: scheduledAt,
    localDate: localDate,
    status: "PENDING",
  });

  return response;
};

export const cancelReminder = async ({
  reminderId,
}: {
  reminderId: string;
}) => {
  const response = await updateStatusReminder({
    id: reminderId,
    status: "CANCELLED",
  });
};

export const formatRemindersToAi = ({
  reminders_list,
}: {
  reminders_list: (typeof reminders.$inferSelect)[];
}) => {
  if (reminders_list.length === 0) return [];

  return reminders_list.map((reminder) => ({
    id: reminder.id,
    title: reminder.text,
    message: reminder.text,
    date: reminder?.scheduledAt?.toISOString() || null,
  }));
};

export const getRemindersUserByPhone = async ({ phone }: { phone: string }) => {
  const pending_reminders = await getPendingRemindersByPhone(phone);
  if (pending_reminders.length === 0) {
    return [];
  }
  const reminders = formatRemindersToAi({ reminders_list: pending_reminders });
  return reminders;
};
