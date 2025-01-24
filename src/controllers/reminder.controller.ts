import {
  getReminderLastMinute,
  updateStatusReminder,
} from "@/db/queries/reminders";
import { sendReplyReminder } from "@/lib/infobip";

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
