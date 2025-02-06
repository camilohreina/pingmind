export interface WhatsAppMessage {
  messageId: string;
  message?: {
    text?: string;
  };
  from: string;
}

export interface MessageResponse {
  status: string;
  message?: string;
}

export interface SendMessageParams {
  toNumber: string;
  message: string;
  config: {
    apiKey: string;
    baseUrl: string;
    whatsappNumber: string;
  };
}

export interface TemplateDataProps {
  body: {
    placeholders: string[];
  };
  buttons?: {
    type: string;
    parameter: string;
  }[];
}