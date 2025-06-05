import {
  createLogMessage,
  getLogMessage,
  getLogMessagesContext,
} from "@/db/queries/log-messages";

import { getUserByPhone, UserI } from "@/db/queries/users";
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
import { PLANS } from "@/config/pricing";
import crypto from "crypto";
import { getCompletedRemindersByUser } from "@/db/queries/reminders";
import { LEMON_PATH_OBJ } from "@/config/constants";

interface reminderReview {
  userId: string;
  message: string;
  phone: string;
  timezone: string;
}

const hasActiveSubscription = (user: UserI): boolean => {
  return Boolean(
    user.stripe_price_id &&
      user.stripe_current_period_end &&
      user.stripe_current_period_end.getTime() + 86_400_000 > Date.now(),
  );
};

const hasFeatureAccess = (user: UserI, messageType: string): boolean => {
  const plan = PLANS.find(
    (plan) => plan.mode[LEMON_PATH_OBJ].variantId === user.stripe_plan_id,
  );
  if (!plan) return false;

  if (messageType === "AUDIO" && !plan.voiceRecognition) return false;
  if (messageType === "IMAGE" && !plan.imageRecognition) return false;

  return true;
};

const hasQuotaAvailable = async (user: UserI): Promise<boolean> => {
  const plan = PLANS.find(
    (plan) => plan.mode[LEMON_PATH_OBJ].variantId === user.stripe_plan_id,
  );

  if (!plan) return false;

  if (!user.stripe_current_period_start) {
    return false;
  }

  const [monthlyMessages] = await getCompletedRemindersByUser({
    userId: user.id,
    startDate: user.stripe_current_period_start,
    endDate: new Date(),
  });
  return monthlyMessages.count < plan.quota;
};

export const handleWebhook = async (data: WhatsAppMessage): Promise<any> => {
  try {
    const message = data.message?.text || "";
    const from_number = data.from;

    const message_processed = await getLogMessage(data?.messageId);

    if (message_processed) {
      return { status: "success", action: "message_already_processed" };
    }

    const user = await getUserByPhone(from_number);
    if (!user) {
      await sendRegisterMessage(from_number, message);
      return { status: "success", action: "send_register_user" };
    }

    const type_message = data.message?.type;

    // First verify active subscription for all message types
    if (!hasActiveSubscription(user)) {
      await sendReplyReminder({
        phone: from_number,
        message:
          "You need an active subscription to use this feature. Please subscribe to continue.",
      });
      return { status: "error", action: "no_active_subscription" };
    }

    // Check quota for all message types
    const hasQuota = await hasQuotaAvailable(user);
    if (!hasQuota) {
      await sendReplyReminder({
        phone: from_number,
        message:
          "You have reached your monthly message quota. Please upgrade your plan to continue using the service.",
      });
      return { status: "error", action: "quota_exceeded" };
    }

    // Then verify specific feature access for audio/image
    if (
      (type_message === "AUDIO" || type_message === "IMAGE") &&
      !hasFeatureAccess(user, type_message)
    ) {
      await sendReplyReminder({
        phone: from_number,
        message: `This feature is not available in your current plan. Please upgrade to use ${type_message.toLowerCase()} messages.`,
      });
      return { status: "error", action: "subscription_feature_not_available" };
    }

    let result: { status: string; ok: boolean; used_tool?: boolean } = {
      status: "success",
      ok: true,
    };
    let content = message;

    if (type_message === "TEXT") {
      result = await handleReminder({
        userId: user.id,
        message,
        phone: from_number,
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
          phone: from_number,
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
        content = message_image,
        result = await handleReminder({
          userId: user.id,
          message: content,
          phone: from_number,
          timezone: user.timezone,
        });
        return result;
      }
    }
    const log_message = {
      id: crypto.randomUUID(),
      message_id: data?.messageId,
      user_id: user.id,
      content,
      used_context: false,
    };

    if (result.ok && result.used_tool) {
      log_message.used_context = true;
    }
    createLogMessage(log_message);

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
    const format_context = context.map((item) => ({
      id: item.id,
      content: item.content,
      is_reply: item.is_reply,
    }));
    const { hasUsedReminderTool, text } = await processMessageByUser({
      userId,
      message,
      phone: phone,
      context_messages: format_context,
      timezone,
    });

    if (text) {
      await sendReplyReminder({
        phone,
        message: text,
      });

      return {
        ok: true,
        status: "success",
        message: text,
        used_tool: hasUsedReminderTool,
      };
    }

    return {
      ok: false,
      status: "error",
      error: "reminder_error",
      used_tool: false,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      status: "error",
      error: "internal_server_error",
      used_tool: false,
    };
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
    throw new Error("Audio ID not found in the URL");
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
    throw new Error("Image ID not found in the URL");
  }
  const response: AsyncIterable<Uint8Array> = await getMediaInfobip({
    mediaId: mediaId,
  });

  const transcription = await getTextFromImage(response);
  return transcription;
};
