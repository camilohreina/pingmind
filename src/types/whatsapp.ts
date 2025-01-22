export interface WhatsAppMessage {
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
