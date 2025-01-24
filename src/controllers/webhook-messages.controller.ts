import { createLogMessage, getLogMessage } from "@/db/queries/log-messages";
import {
  createReminder,
  getPendingRemindersByUser,
  getReminderSame,
} from "@/db/queries/reminders";
import { getUserByPhone } from "@/db/queries/users";
import { processUserMessage } from "@/lib/ai";
import { AiError } from "@/lib/error";
import { sendRegisterMessage, sendReplyReminder } from "@/lib/infobip";
import { WhatsAppMessage } from "@/types/whatsapp";
import {
  addNewReminder,
  cancelReminder,
  formatRemnindersToAi,
  updatePendingReminder,
} from "./reminder.controller";

interface reminderReview {
  userId: string;
  message: string;
  phone: string;
  timezone: string;
}

export const handleWebhook = async (data: WhatsAppMessage): Promise<any> => {
  try {
    const message = data.message?.text || "";
    const fromNumber = data.from;

    const messageProcessed = await getLogMessage(data?.messageId);

    if (messageProcessed) {
      console.log("Message already processed");
      return { status: "success", action: "message_already_processed" };
    }

    const user = await getUserByPhone(fromNumber);
    if (!user) {
      await sendRegisterMessage(fromNumber);
      return { status: "success", action: "send_register_user" };
    }
    //TODO: aqui la logica para verificar si tiene un plan activo
    const result = await handleReminder({
      userId: user.id,
      message,
      phone: fromNumber,
      timezone: user.timezone,
    });
    return result;
  } catch (error) {
    throw new AiError("Error processing message with AI");
  } finally {
    createLogMessage({
      id: crypto.randomUUID(),
      messageId: data?.messageId,
    });
  }
};

export const handleReminder = async ({
  userId,
  message,
  phone,
  timezone,
}: reminderReview) => {
  try {
    const reminders_list = await getPendingRemindersByUser(userId);
    const formatted_reminders = formatRemnindersToAi({ reminders_list });
    const reminder_user = await processUserMessage({
      message,
      phone: phone,
      timezone: timezone,
      reminders: formatted_reminders,
    });

    if (!reminder_user)
      return { status: "error", error: "ai_error_process", ok: false };

    if (reminder_user.action === "CREATE") {
      await addNewReminder({
        phone,
        userId,
        reminder_user,
      });
      return { status: "success", action: "create", ok: true };
    }
    if (reminder_user?.reminderId) {
      console.log({reminderId: reminder_user.reminderId});
      if (reminder_user.action === "UPDATE") {
        await updatePendingReminder({
          reminderId: reminder_user.reminderId,
          phone,
          reminder_user,
        });
        return { status: "success", action: "update", ok: true };
      }

      if (reminder_user.action === "DELETE") {
        await cancelReminder({
          reminderId: reminder_user.reminderId,
          phone,
          reminder_user,
        });
        return { status: "success", action: "delete", ok: true };
      }
    }

    if (reminder_user.action === "NO ACTION") {
      return { status: "success", action: "no_action", ok: true };
    }

    return { status: "error", error: "reminder_error", ok: false };
  } catch (error) {
    return { status: "error", error: "internal_server_error", ok: false };
  }
};
