import { sendRegisterMessage } from "@/lib/infobip";
import { shouldReplyToMessage } from "@/lib/utils";
import { WhatsAppMessage } from "@/types/whatsapp";

export const handleWebhook = async (data: WhatsAppMessage): Promise<any> => {
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
