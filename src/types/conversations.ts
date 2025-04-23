// Tipos de interacción para hacer el agente más conversacional
export enum ConversationType {
  GREETING = "GREETING",               // Saludo inicial
  QUESTION = "QUESTION",               // Pregunta informativa
  REMINDER_CREATION = "REMINDER_CREATION", // Creación de recordatorio
  REMINDER_UPDATE = "REMINDER_UPDATE",   // Actualización de recordatorio
  REMINDER_DELETION = "REMINDER_DELETION", // Eliminación de recordatorio
  REMINDER_LIST = "REMINDER_LIST",      // Listar recordatorios
  HELP = "HELP",                       // Solicitud de ayuda
  CHAT = "CHAT",                       // Conversación general
  UNKNOWN = "UNKNOWN"                  // No se pudo clasificar
}

// Interfaces para el historial de conversaciones
export interface ConversationMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  messageType?: ConversationType;
}

// Interfaz para una conversación completa
export interface Conversation {
  id: string;
  userId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Interfaz para el resultado de la clasificación de mensaje
export interface MessageClassification {
  conversationType: ConversationType;
  confidence: number;
  detectedIntent: string;
  needsMoreInfo: boolean;
  suggestedPrompt: string;
  possibleReminderText?: string;
  possibleReminderDate?: string;
}

// Interfaz para respuesta conversacional
export interface ConversationalResponse {
  response: string;
  followUpQuestion?: string;
  shouldAskForConfirmation: boolean;
  suggestedActions: string[];
} 