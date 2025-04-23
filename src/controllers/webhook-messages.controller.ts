import { createLogMessage, getLogMessage } from "@/db/queries/log-messages";
import {
  createReminder,
  getPendingRemindersByUser,
  getReminderSame,
} from "@/db/queries/reminders";
import { getUserByPhone } from "@/db/queries/users";
import { processUserMessage } from "@/lib/ai";
import { AiError } from "@/lib/error";
import { getMediaInfobip, sendRegisterMessage, sendReplyReminder } from "@/lib/infobip";
import { WhatsAppMessage } from "@/types/whatsapp";
import {
  addNewReminder,
  cancelReminder,
  formatRemindersToAi,
  updatePendingReminder,
} from "./reminder.controller";
import { extractMediaId } from "@/lib/utils";
import { getTextFromAudio, getTextFromImage } from "./ai.controller";
import { handleConversationalMessage } from "@/lib/whatsapp-conversations";
import { ConversationType } from "@/types/conversations";

// Definir tipos de conversación localmente para evitar conflictos
enum MessageType {
  GREETING = "GREETING",
  QUESTION = "QUESTION",
  REMINDER_CREATION = "REMINDER_CREATION",
  REMINDER_UPDATE = "REMINDER_UPDATE",
  REMINDER_DELETION = "REMINDER_DELETION",
  REMINDER_LIST = "REMINDER_LIST",
  HELP = "HELP",
  CHAT = "CHAT",
  UNKNOWN = "UNKNOWN"
}

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
    const messageId = data?.messageId || "";

    // Verificar si el mensaje ya fue procesado
    const messageProcessed = await getLogMessage(messageId);

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

    let processedMessage = message;

    // Procesar mensajes de audio y convertirlos a texto
    if (type_message === "AUDIO" && data.message?.url) {
      const audioMessage = {
        url: data.message.url,
        type: "AUDIO",
      };
      const message_audio = await handleAudioReminder({
        message: audioMessage,
      });
      if (message_audio) {
        processedMessage = message_audio;
      } else {
        // Si el procesamiento de audio falló, mantenemos el mensaje original
        processedMessage = "No pude entender tu mensaje de audio. ¿Podrías intentar nuevamente?";
      }
    }

    // Procesar mensajes de imagen y convertirlos a texto
    if (type_message === "IMAGE" && data.message?.url) {
      const imageMessage = {
        url: data.message.url,
        type: "IMAGE",
      };
      const message_image = await handleImageReminder({
        message: imageMessage,
      });
      if (message_image) {
        processedMessage = message_image;
      } else {
        // Si el procesamiento de imagen falló, mantenemos un mensaje genérico
        processedMessage = "No pude procesar correctamente tu imagen. ¿Podrías describirla en un mensaje de texto?";
      }
    }

    // Obtener recordatorios pendientes del usuario
    const pendingReminders = await getPendingRemindersByUser(user.id);

    // Usar el nuevo manejador conversacional
    const conversationalResult = await handleConversationalMessage({
      userId: user.id,
      message: processedMessage,
      phone: fromNumber,
      timezone: user.timezone,
      userName: user.name || undefined,
      language: 'es', // Por defecto español, puedes usar la preferencia del usuario si está disponible
      pendingReminders: pendingReminders.length
    });

    // Enviar la respuesta conversacional al usuario
    await sendReplyReminder({
      phone: fromNumber,
      message: conversationalResult.responseMessage
    });

    // Si la clasificación del mensaje indica que es un intento de crear un recordatorio y tenemos toda la información necesaria
    if (conversationalResult.messageType === ConversationType.REMINDER_CREATION && !conversationalResult.needsMoreInfo) {
      // Proceder con el procesamiento tradicional para crear el recordatorio
      const result = await handleReminder({
        userId: user.id,
        message: processedMessage,
        phone: fromNumber,
        timezone: user.timezone,
      });
      
      return { 
        ...result, 
        conversational: true, 
        conversationalResponse: conversationalResult.responseMessage 
      };
    }

    // Para otros tipos de mensajes, devolvemos el resultado del procesamiento conversacional
    return { 
      status: "success", 
      action: "conversational_response", 
      conversational: true,
      messageType: conversationalResult.messageType,
      responseMessage: conversationalResult.responseMessage
    };

  } catch (error) {
    console.log(error);
    throw new AiError("Error processing message with AI");
  } finally {
    // Guarda el ID del mensaje como procesado
    if (data?.messageId) {
      createLogMessage({
        id: crypto.randomUUID(),
        messageId: data.messageId,
      });
    }
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
    console.log("Recordatorios pendientes del usuario:", userId, reminders_list.length);
    
    const formatted_reminders = formatRemindersToAi({ reminders_list });
    
    console.log("Recordatorios enviados a la IA:", JSON.stringify(formatted_reminders, null, 2));
    
    const reminder_user = await processUserMessage({
      message,
      phone: phone,
      timezone: timezone,
      reminders: formatted_reminders,
    });

    if (!reminder_user)
      return { status: "error", error: "ai_error_process", ok: false };
      
    console.log("Respuesta de la IA para actualización:", {
      action: reminder_user.action,
      reminderId: reminder_user.reminderId,
      message: reminder_user.message,
      reminderDate: reminder_user.reminderDate
    });
    
    if (reminder_user.action === "CREATE") {
      await addNewReminder({
        phone,
        userId,
        reminder_user,
      });
      return { status: "success", action: "create", ok: true };
    }
    
    // Validación adicional para UPDATE - Debe tener un ID de recordatorio válido
    if (reminder_user.action === "UPDATE") {
      if (!reminder_user.reminderId) {
        console.log("ERROR: Se solicitó UPDATE pero faltó reminderId. Mensaje:", message);
        
        // Enviar mensaje al usuario explicando el problema
        await sendReplyReminder({
          phone,
          message: "Lo siento, no pude identificar qué recordatorio deseas actualizar. ¿Podrías especificar más detalles como el asunto o la hora del recordatorio original?"
        });
        
        return { status: "error", error: "missing_reminder_id", action: "update_failed", ok: false };
      }
      
      // Verificar si el ID existe en la lista de recordatorios pendientes
      const reminderExists = reminders_list.some(rem => rem.id === reminder_user.reminderId);
      if (!reminderExists) {
        console.log(`ERROR: ReminderId ${reminder_user.reminderId} no encontrado en recordatorios pendientes`);
        
        await sendReplyReminder({
          phone,
          message: "Lo siento, no encontré ese recordatorio en tu lista de pendientes. Es posible que ya se haya completado o cancelado."
        });
        
        return { status: "error", error: "reminder_not_found", action: "update_failed", ok: false };
      }
    }
    
    if (reminder_user?.reminderId) {
      console.log("Procesando recordatorio con ID:", reminder_user.reminderId);
      if (reminder_user.action === "UPDATE") {
        const updateResult = await updatePendingReminder({
          reminderId: reminder_user.reminderId,
          phone,
          reminder_user,
        });
        console.log("Resultado de updatePendingReminder:", updateResult);
        
        if (updateResult.ok) {
          return { status: "success", action: "update", ok: true };
        } else {
          // Si la actualización falló, enviar mensaje específico al usuario
          await sendReplyReminder({
            phone,
            message: "Lo siento, hubo un problema al actualizar tu recordatorio. Por favor, intenta de nuevo."
          });
          // Devolver un objeto con la estructura correcta
          return {
            status: "error", 
            action: "update_failed", 
            ok: false,
            errorType: "update_failed"
          };
        }
      }

      if (reminder_user.action === "DELETE") {
        await cancelReminder({
          reminderId: reminder_user.reminderId,
          phone,
          reminder_user,
        });
        return { status: "success", action: "delete", ok: true };
      }
    } else if (reminder_user.action === "UPDATE" || reminder_user.action === "DELETE") {
      console.log("ERROR: Se solicitó UPDATE o DELETE pero no se proporcionó reminderId");
      return { status: "error", error: "missing_reminder_id", ok: false };
    }

    if (reminder_user.action === "NO ACTION") {
      return { status: "success", action: "no_action", ok: true };
    }

    return { status: "error", error: "reminder_error", ok: false };
  } catch (error) {
    console.log("Error en handleReminder:", error);
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
}): Promise<string | undefined> => {
  const { url } = message;
  const mediaId = extractMediaId(url);
  if (!mediaId) {
    return undefined;
  }
  try {
    const response: AsyncIterable<Uint8Array> = await getMediaInfobip({
      mediaId: mediaId,
    });
    const transcription = await getTextFromAudio(response);
    return transcription;
  } catch (error) {
    console.error("Error procesando audio:", error);
    return undefined;
  }
};

export const handleImageReminder = async ({
  message,
}: {
  message: MediaMessageReview;
}): Promise<string | undefined> => {
  const { url } = message;
  const mediaId = extractMediaId(url);
  if (!mediaId) {
    return undefined;
  }
  try {
    const response: AsyncIterable<Uint8Array> = await getMediaInfobip({
      mediaId: mediaId,
    });
    const transcription = await getTextFromImage(response);
    if (typeof transcription === 'string') {
      return transcription;
    }
    return undefined;
  } catch (error) {
    console.error("Error procesando imagen:", error);
    return undefined;
  }
};
