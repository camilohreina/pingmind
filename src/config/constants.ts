export const TRIGGER_REGISTER_WORDS = ["hi", "hola", "buenas", "hello"];

export const AUTO_REPLY_REGISTER = `¡Hola! 👋 Este es un mensaje de Camilo, el creador de PingMind:
¡Tengo buenas noticias! Ahora puedes probar PingMind gratis por 3 días y descubrir todas sus funcionalidades 🎉
Ingresa a la web para registrarte y elegir uno de nuestros planes. Tranqui, puedes cancelar en cualquier momento 🤝
www.pingmind.app/signin/signup?phone=573224354004
Una vez tengas un plan, vuelve a esta conversación y envía un mensaje para seguir conversando.
Si tienes alguna duda, escríbeme por WhatsApp al +525652247590 - Estoy para ayudarte.
¡Gracias por ser parte de esta aventura! 🚀`;

export const getInfobipConfig = () => ({
  apiKey: process.env.INFOBIP_API_KEY || "",
  baseUrl: process.env.INFOBIP_BASE_URL || "",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "",
});
