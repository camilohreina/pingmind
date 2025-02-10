import { reminders } from "@/db";
import {
  createReminder,
  getReminderLastMinute,
  updateReminder,
  updateStatusReminder,
} from "@/db/queries/reminders";
import { sendReplyReminder } from "@/lib/infobip";

type ReminderUser = {
  date: string;
  timezone: string;
  title: string;
  localDate: string;
  reminderDate: string;
  response: string;
  alert: string;
  message: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "NO ACTION";
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
  userId,
  reminder_user,
}: {
  phone: string;
  userId: string;
  reminder_user: ReminderUser;
}) => {
  try {
    const reminder = await createReminder({
      id: crypto.randomUUID(),
      userId,
      text: reminder_user.message,
      scheduledAt: new Date(reminder_user.reminderDate),
      status: "PENDING",
      response: reminder_user.response,
      alert: reminder_user.alert,
      localDate: new Date(reminder_user.localDate),
    });
    if (reminder) {
        await sendReplyReminder({
        phone,
        message: reminder_user.response,
      });
      return { status: "success", ok: true };
    }
  } catch (error) {}
};

export const updatePendingReminder = async ({
  reminderId,
  phone,
  reminder_user,
}: {
  reminderId: string;
  phone: string;
  reminder_user: ReminderUser;
}) => {
  const response = await updateReminder({
    id: reminderId,
    text: reminder_user.message,
    scheduledAt: new Date(reminder_user.reminderDate),
    status: "PENDING",
  });
  if (response) {
    await sendReplyReminder({
      phone,
      message: reminder_user.response,
    });
    return { status: "success", ok: true };
  }
};

export const cancelReminder = async ({
  reminderId,
  phone,
  reminder_user,
}: {
  reminderId: string;
  phone: string;
  reminder_user: ReminderUser;
}) => {
  const response = await updateStatusReminder({
    id: reminderId,
    status: "CANCELLED",
  });
  if (response) {
    await sendReplyReminder({
      phone,
      message: reminder_user.response,
    });
    return { status: "success", ok: true };
  }
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
