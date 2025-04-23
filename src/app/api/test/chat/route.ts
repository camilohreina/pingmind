import { NextResponse } from "next/server";

import { processUserMessage } from "@/lib/ai";
import { getTimeZoneFromCountryCode } from "@/lib/utils";
import { handleWebhook } from "@/controllers/webhook-messages.controller";
import { handleConversationalMessage } from "@/lib/whatsapp-conversations";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Manejador para un solo mensaje
async function handleSingleMessage(message: string, phone: string, timezone: string, userName: string = "Usuario de Prueba") {
  // Prueba directa del manejador conversacional
  const conversationalResult = await handleConversationalMessage({
    userId: phone, // Usar el teléfono como ID de usuario para mantener coherencia
    message: message,
    phone: phone,
    timezone: timezone,
    userName: userName,
    language: 'es',
    pendingReminders: 0
  });
  
  return conversationalResult;
}

// Manejador para probar una conversación completa con múltiples mensajes
async function handleConversation(messages: string[], phone: string, timezone: string, userName: string = "Usuario de Prueba") {
  const results = [];
  
  for (const message of messages) {
    const result = await handleSingleMessage(message, phone, timezone, userName);
    results.push({
      userMessage: message,
      botResponse: result.responseMessage,
      messageType: result.messageType,
      needsMoreInfo: result.needsMoreInfo
    });
  }
  
  return results;
}

export async function POST(req: Request): Promise<NextResponse> {
  // Obtener datos de la solicitud
  const data = await req.json();
  const { message, messages, phone, countryCode, userName } = data;
  
  const timezone = getTimeZoneFromCountryCode(countryCode) || "America/Mexico_City";
  const userPhone = phone || "+123456789";
  const userDisplayName = userName || "Usuario de Prueba";

  // Si se proporciona una lista de mensajes, procesar la conversación completa
  if (messages && Array.isArray(messages) && messages.length > 0) {
    const conversationResults = await handleConversation(messages, userPhone, timezone, userDisplayName);
    
    return NextResponse.json(
      {
        ok: true,
        status: 200,
        results: conversationResults,
        summary: "Conversación procesada con éxito"
      },
      {status: 200},
    );
  }
  
  // Caso de un solo mensaje (comportamiento original)
  else if (message) {
    const conversationalResult = await handleSingleMessage(message, userPhone, timezone, userDisplayName);
    
    // Formato para un solo mensaje procesado
    const infoTest = {
      message:{
        text: message,
        type: "TEXT"
      },
      from: userPhone,
      messageId: 'test-' + Date.now(),
    }
    
    // Retornar el resultado del procesamiento conversacional
    return NextResponse.json(
      {
        ok: true,
        status: 200,
        conversationalResult: conversationalResult,
        message: conversationalResult.responseMessage
      },
      {status: 200},
    );
  }
  
  // Si no se proporcionó mensaje ni lista de mensajes
  else {
    return NextResponse.json(
      {
        ok: false,
        status: 400,
        error: "Se requiere al menos un mensaje o una lista de mensajes"
      },
      {status: 400},
    );
  }
}
