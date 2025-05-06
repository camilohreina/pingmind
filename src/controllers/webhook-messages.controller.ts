import { createLogMessage, getLogMessage, getLogMessagesContext } from "@/db/queries/log-messages";

import { getUserByPhone } from "@/db/queries/users";
import { processMessageByUser } from "@/lib/ai";
import { AiError } from "@/lib/error";
import {
  getMediaInfobip,
  sendRegisterMessage,
  sendReplyReminder,
} from "@/lib/infobip";
import { WhatsAppMessage } from "@/types/whatsapp";
import { extractMediaId } from "@/lib/utils";
import { getTextFromAudio, getTextFromImage } from "./ai.controller";

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
      return { status: "success", action: "message_already_processed" };
    }

    const user = await getUserByPhone(fromNumber);
    if (!user) {
      await sendRegisterMessage(fromNumber);
      return { status: "success", action: "send_register_user" };
    }
    //TODO: aqui la logica para verificar si tiene un plan activo

    const type_message = data.message?.type;

    let result = { status: "success", ok: true };
    let content = message;

    if (type_message === "TEXT") {
      result = await handleReminder({
        userId: user.id,
        message,
        phone: fromNumber,
        timezone: user.timezone,
      });
    }

    if (type_message === "AUDIO" && data.message?.url) {
      const audioMessage = {
        url: data.message.url,
        type: "AUDIO",
      };
      const message_audio = await handleAudioReminder({
        message: audioMessage,
      });
      if (message_audio) {
        content = message_audio;
        result = await handleReminder({
          userId: user.id,
          message: message_audio,
          phone: fromNumber,
          timezone: user.timezone,
        });
        return result;
      }
    }

    if (type_message === "IMAGE" && data.message?.url) {
      const imageMessage = {
        url: data.message.url,
        type: "IMAGE",
      };
      const message_image = await handleImageReminder({
        message: imageMessage,
      });
      if (message_image) {
        content = message_image;
        result = await handleReminder({
          userId: user.id,
          message: message_image,
          phone: fromNumber,
          timezone: user.timezone,
        });
        return result;
      }
    }
    createLogMessage({
      id: crypto.randomUUID(),
      message_id: data?.messageId,
      user_id: user.id,
      content,
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new AiError("Error processing message with AI");
  } finally {
 
  }
};

export const handleReminder = async ({
  userId,
  message,
  phone,
  timezone,
}: reminderReview) => {
  try {
    const context = await getLogMessagesContext(userId);
    const format_context = context.map((item) => ({id: item.id, content: item.content, is_reply: item.is_reply})); 
    const response_user = await processMessageByUser({
      userId,
      message,
      phone: phone,
      context_messages: format_context
    });

    if (response_user) {
   /*    await sendReplyReminder({
        phone,
        message: response_user,
      }); */

      return { ok: true, status: "success", message: response_user };
    }

    return { status: "error", error: "reminder_error", ok: false };
  } catch (error) {
    console.log(error);
    return { status: "error", error: "internal_server_error", ok: false };
  }
};

interface MediaMessageReview {
  url: string;
  type: string;
}

export const handleAudioReminder = async ({
  message,
}: {
  message: MediaMessageReview;
}) => {
  const { url } = message;
  const mediaId = extractMediaId(url);
  if (!mediaId) {
    return null;
  }
  const response: AsyncIterable<Uint8Array> = await getMediaInfobip({
    mediaId: mediaId,
  });
  const transcription = await getTextFromAudio(response);
  return transcription;
};

export const handleImageReminder = async ({
  message,
}: {
  message: MediaMessageReview;
}) => {
  const { url } = message;
  const mediaId = extractMediaId(url);
  if (!mediaId) {
    return null;
  }
  const response: AsyncIterable<Uint8Array> = await getMediaInfobip({
    mediaId: mediaId,
  });

  const transcription = await getTextFromImage(response);
  return transcription;
};
