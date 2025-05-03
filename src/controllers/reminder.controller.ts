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

    const reminder = await createReminder({
      id: crypto.randomUUID(),
      userId: user.id,
      text: reminder_user.message,
      scheduledAt: new Date(reminder_user.reminderDate),
      status: "PENDING",
      response: reminder_user.response,
      alert: reminder_user.alert,
      localDate: new Date(reminder_user.localDate),
    });
    /*     if (reminder) {
        await sendReplyReminder({
        phone,
        message: reminder_user.response,
      });
      return { status: "success", ok: true };
    } */
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
  /*   if (response) {
    await sendReplyReminder({
      phone,
      message: reminder_user.response,
    });
    return { status: "success", ok: true };
  } */
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
  /*   if (response) {
    await sendReplyReminder({
      phone,
      message: reminder_user.response,
    });
    return { status: "success", ok: true };
  } */
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
