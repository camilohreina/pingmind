import { getUserByPhone } from "@/db/queries/users";
import { processUserMessage } from "@/lib/ai";
import { sendRegisterMessage } from "@/lib/infobip";
import { WhatsAppMessage } from "@/types/whatsapp";

export const handleWebhook = async (data: WhatsAppMessage): Promise<any> => {
  try {
    const message = data.message?.text || "";
    const fromNumber = data.from;

    const user = await getUserByPhone(fromNumber);
    if (!user) {
      await sendRegisterMessage(fromNumber);
      return { status: "success", action: "send_register_user" };
    }
    //TODO: aqui la logica para verificar si tiene un plan activo
    processUserMessage({
      message,
      phone: fromNumber,
      timezone: "America/Bogota",
    });
  } catch (error) {}
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
