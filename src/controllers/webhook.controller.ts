import { createLogMessage, getLogMessage } from "@/db/queries/log-messages";
import { createReminder, getReminderSame } from "@/db/queries/reminders";
import { getUserByPhone } from "@/db/queries/users";
import { processUserMessage } from "@/lib/ai";
import { AiError } from "@/lib/error";
import { sendRegisterMessage } from "@/lib/infobip";
import { WhatsAppMessage } from "@/types/whatsapp";

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
    const reminder_user = await processUserMessage({
      message,
      phone: phone,
      timezone: timezone,
    });

    if (!reminder_user)
      return { status: "error", error: "ai_error_process", ok: false };

    const equalReminder = await getReminderSame({
      text: reminder_user.message,
      scheduledAt: new Date(reminder_user.date),
      userId,
      status: "PENDING",
    });

    if (equalReminder) {
      return { status: "success", ok: true };
    }

    const reminder = await createReminder({
      id: crypto.randomUUID(),
      userId,
      text: reminder_user.message,
      scheduledAt: new Date(reminder_user.date),
      status: "PENDING",
    });

    if (reminder) {
      console.log("equal reminder");
      return { status: "success", ok: true };
    }

    return { status: "error", error: "reminder_not_created", ok: false };
  } catch (error) {
    return { status: "error", error: "internal_server_error", ok: false };
  }
};

/* export const handleWebhook = async (data: WhatsAppMessage): Promise<any> => {
  try {
    const message = data.message?.text || "";
    const fromNumber = data.from;

    if (shouldReplyToMessage(message)) {
      console.log(`Received message from ${fromNumber}: ${message}`);
      await sendRegisterMessage();
    }

    return { status: "success" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing webhook:", errorMessage);
    return { status: "error", message: errorMessage };
  }
};
 */
