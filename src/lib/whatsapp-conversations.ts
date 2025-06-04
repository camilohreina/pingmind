import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { sendReplyReminder } from "./infobip";
import { ConversationType } from "@/types/conversations";

// Almacenamiento temporal de conversaciones por usuario
// En producción, esto debería estar en una base de datos
const conversationStore: Record<string, {
  messages: Array<{ role: 'user' | 'assistant', content: string, timestamp: number }>,
  lastUpdated: number
}> = {};

// Tiempo de expiración de conversaciones en ms (10 minutos)
const CONVERSATION_EXPIRY = 10 * 60 * 1000;

// Esquema para la clasificación de mensajes
const conversationClassifierSchema = z.object({
  conversationType: z.nativeEnum(ConversationType),
  confidence: z.number().min(0).max(1),
  detectedIntent: z.string(),
  needsMoreInfo: z.boolean(),
  suggestedPrompt: z.string(),
  possibleReminderText: z.string().optional(),
  possibleReminderDate: z.string().optional(),
});

// Función para limpiar conversaciones expiradas
const cleanupExpiredConversations = () => {
  const now = Date.now();
  Object.keys(conversationStore).forEach(userId => {
    if (now - conversationStore[userId].lastUpdated > CONVERSATION_EXPIRY) {
      delete conversationStore[userId];
    }
  });
};

// Función para obtener o crear conversación de usuario
const getUserConversation = (userId: string) => {
  // Limpiar conversaciones viejas periódicamente
  cleanupExpiredConversations();
  
  if (!conversationStore[userId]) {
    conversationStore[userId] = {
      messages: [],
      lastUpdated: Date.now()
    };
  }
  
  return conversationStore[userId];
};

// Función para guardar mensaje en la conversación
const saveMessageToConversation = (userId: string, role: 'user' | 'assistant', content: string) => {
  const conversation = getUserConversation(userId);
  conversation.messages.push({
    role,
    content,
    timestamp: Date.now()
  });
  conversation.lastUpdated = Date.now();
  
  // Limitar a los últimos 10 mensajes para evitar tokens excesivos
  if (conversation.messages.length > 10) {
    conversation.messages = conversation.messages.slice(-10);
  }
};

// Función para clasificar el tipo de mensaje
export const classifyMessage = async (message: string, userId: string, previousMessages: Array<{ role: 'user' | 'assistant', content: string }> = []) => {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: conversationClassifierSchema,
      prompt: `
      ${previousMessages.length > 0 ? 
        `Historial de conversación reciente:
        ${previousMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` 
        : ''}
      
      Mensaje actual del usuario: "${message}"
      `,
      system: `
        Eres un asistente especializado en analizar mensajes de WhatsApp para determinar las intenciones de los usuarios.
        Tu tarea principal es analizar el mensaje y determinar si el usuario está:
        1. Saludando o iniciando una conversación (GREETING)
        2. Haciendo una pregunta sobre el servicio (QUESTION)
        3. Intentando crear un recordatorio (REMINDER_CREATION)
        4. Intentando actualizar un recordatorio existente (REMINDER_UPDATE)
        5. Intentando eliminar un recordatorio existente (REMINDER_DELETION)
        6. Pidiendo ver sus recordatorios (REMINDER_LIST)
        7. Pidiendo ayuda sobre cómo usar el servicio (HELP)
        8. Simplemente conversando (CHAT)
        9. Si no puedes determinar claramente la intención (UNKNOWN)

        Al analizar el mensaje, debes enfocarte principalmente en detectar si hay intención de crear recordatorios, 
        pues esa es la función principal del servicio.
        
        IMPORTANTE: Considera también el CONTEXTO COMPLETO de la conversación. Si hay mensajes previos, estos pueden 
        contener información relevante para entender la intención del usuario actual. Por ejemplo:
        - Si el usuario dijo "Mañana voy al médico" y ahora dice "A las 9am", debes entender que está proporcionando 
          la hora para un recordatorio médico.
        - Si el asistente preguntó "¿A qué hora?" y el usuario responde solo con una hora, se debe asociar con el tema anterior.

        Ejemplos de intención REMINDER_CREATION:
        - "Recuérdame llamar al médico mañana a las 3pm"
        - "Tengo una cita el viernes 10 de julio"
        - "No olvides que tengo que pagar el recibo el día 5"
        - "El martes hay reunión a las 9"
        
        Incluso mensajes indirectos como "Tengo que ir al dentista el lunes" deben ser considerados como 
        potenciales REMINDER_CREATION, ya que implican un evento en una fecha específica.

        Si detectas que el mensaje contiene información de un recordatorio, pero falta información como la hora o la fecha,
        'needsMoreInfo' debe ser true y debes sugerir un mensaje para solicitar la información faltante.

        Ejemplos donde needsMoreInfo = true:
        - "Tengo que comprar leche" (falta fecha/hora)
        - "Reunión con Juan" (falta fecha/hora)
        - "Mañana" (falta el detalle del recordatorio)

        En 'suggestedPrompt', proporciona una respuesta amigable y conversacional que el bot debería enviar. 
        En 'possibleReminderText' y 'possibleReminderDate' extrae el texto y fecha del recordatorio si existe.
        
        IMPORTANTE PARA EL CONTEXTO:
        - Si el usuario está respondiendo a una pregunta previa del asistente, integra esa información con lo que ya sabías de mensajes anteriores.
        - Si hay varios intercambios que juntos forman un recordatorio completo, combina toda la información.
        - Recuerda el contexto completo para evitar preguntar repetidamente la misma información.
      `,
      temperature: 0.3,
    });

    return object;
  } catch (error) {
    console.error("Error clasificando mensaje:", error);
    return {
      conversationType: ConversationType.UNKNOWN,
      confidence: 0,
      detectedIntent: "Error al procesar el mensaje",
      needsMoreInfo: false,
      suggestedPrompt: "Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?"
    };
  }
};

// Esquema para generar respuestas conversacionales
const conversationalResponseSchema = z.object({
  response: z.string(),
  followUpQuestion: z.string().optional(),
  shouldAskForConfirmation: z.boolean(),
  suggestedActions: z.array(z.string()),
});

// Función para generar respuestas conversacionales
export const generateConversationalResponse = async (
  messageHistory: { role: 'user' | 'assistant', content: string }[],
  userContext: {
    name?: string,
    timezone: string,
    language: string,
    pendingReminders: number
  }
) => {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: conversationalResponseSchema,
      prompt: `
      Contexto del usuario:
      - Nombre: ${userContext.name || 'Usuario'}
      - Zona horaria: ${userContext.timezone}
      - Idioma preferido: ${userContext.language}
      - Recordatorios pendientes: ${userContext.pendingReminders}
      
      Historial de conversación:
      ${messageHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      `,
      system: `
        Eres un asistente virtual de recordatorios llamado Pingmind que se comunica a través de WhatsApp.
        Tu función principal es ayudar a los usuarios a crear, gestionar y recibir recordatorios.
        
        Directrices para tus respuestas:
        1. Sé conversacional y amigable, pero conciso (recuerda que es WhatsApp)
        2. Personaliza tus mensajes usando el nombre del usuario cuando esté disponible
        3. Si detectas una intención de crear un recordatorio, guía al usuario para obtener toda la información necesaria
        4. Cuando falte información (fecha, hora o detalles), haz preguntas directas para obtenerla
        5. Ofrece ayuda proactiva basada en el contexto de la conversación
        6. Confirma siempre la creación, modificación o eliminación de recordatorios
        7. Usa emojis con moderación para hacer la conversación más amigable
        8. Adapta tu tono al idioma preferido del usuario
        9. Cuando la solicitud no está relacionada con recordatorios, recuerda amablemente tu función
        
        Tu respuesta debe ser natural, como si fuera un asistente humano conversando en WhatsApp.
        
        IMPORTANTE: Utiliza TODA la información disponible en el historial de la conversación para crear respuestas contextuales.
        Si el usuario ha proporcionado datos de un recordatorio a lo largo de varios mensajes, combina esa información.
        
        Ejemplos de buenas respuestas contextuales:
        - Si el usuario dijo "Mañana voy al médico" y luego "A las 9am", responde confirmando "Crearé un recordatorio para tu cita médica mañana a las 9am"
        - Si has preguntado sobre una fecha y el usuario responde solo con "Mañana", conecta esta información con el contexto previo
        
        Evita preguntar por información que ya ha sido proporcionada en mensajes anteriores.
        
        En 'followUpQuestion' incluye una pregunta relevante para continuar la conversación si es apropiado.
        En 'shouldAskForConfirmation' indica si se debe pedir confirmación para alguna acción.
        En 'suggestedActions' incluye 1-3 posibles acciones que el usuario podría querer realizar.
      `,
      temperature: 0.7,
    });

    return object;
  } catch (error) {
    console.error("Error generando respuesta conversacional:", error);
    return {
      response: "Lo siento, estoy teniendo problemas para procesar tu mensaje. ¿Podrías intentarlo de nuevo?",
      shouldAskForConfirmation: false,
      suggestedActions: ["Crear un nuevo recordatorio", "Ver mis recordatorios"]
    };
  }
};

// Manejador de mensajes entrantes con contexto de conversación
export const handleConversationalMessage = async ({
  userId,
  message,
  phone,
  timezone,
  userName,
  language,
  pendingReminders,
}: {
  userId: string,
  message: string,
  phone: string,
  timezone: string,
  userName?: string,
  language?: string,
  pendingReminders?: number
}) => {
  // Obtener historial de conversación del usuario
  const conversation = getUserConversation(userId);
  const previousMessages = conversation.messages;
  
  // Guardar el mensaje del usuario en el historial
  saveMessageToConversation(userId, 'user', message);
  
  // 1. Clasificar el tipo de mensaje considerando el contexto de conversación previo
  const messageHistoryForClassification = previousMessages
    .map(msg => ({ role: msg.role, content: msg.content }))
    .slice(-5); // Usar solo los últimos 5 mensajes para la clasificación
  
  const classification = await classifyMessage(message, userId, messageHistoryForClassification);
  
  // 2. Personalizar la respuesta basada en la clasificación
  let responseMessage = '';
  
  if (classification.needsMoreInfo) {
    // Si necesitamos más información, enviamos el mensaje sugerido
    responseMessage = classification.suggestedPrompt;
  } else {
    // Usar todo el historial de conversación disponible para generar la respuesta
    const messageHistoryForResponse = previousMessages
      .map(msg => ({ role: msg.role, content: msg.content }));
    
    // Asegurarse de que el mensaje actual esté incluido
    if (messageHistoryForResponse.length === 0 || 
        messageHistoryForResponse[messageHistoryForResponse.length - 1].content !== message) {
      messageHistoryForResponse.push({ role: 'user' as const, content: message });
    }
    
    // Generar una respuesta conversacional basada en todo el historial
    const response = await generateConversationalResponse(
      messageHistoryForResponse,
      {
        name: userName,
        timezone: timezone,
        language: language || 'es',
        pendingReminders: pendingReminders || 0
      }
    );
    
    // Construir la respuesta final
    responseMessage = response.response;
    
    // Añadir pregunta de seguimiento si existe
    if (response.followUpQuestion) {
      responseMessage += `\n\n${response.followUpQuestion}`;
    }
    
    // Si hay acciones sugeridas y no estamos pidiendo confirmación, mostrarlas
    if (response.suggestedActions.length > 0 && !response.shouldAskForConfirmation) {
      responseMessage += `\n\nPuedes:\n${response.suggestedActions.map(action => `• ${action}`).join('\n')}`;
    }
  }
  
  // Guardar la respuesta del asistente en el historial
  saveMessageToConversation(userId, 'assistant', responseMessage);
  
  // 3. Retornar información sobre el procesamiento
  return { 
    status: "success", 
    messageType: classification.conversationType,
    needsMoreInfo: classification.needsMoreInfo,
    possibleReminderText: classification.possibleReminderText,
    possibleReminderDate: classification.possibleReminderDate,
    responseMessage,
    classification
  };
}; 