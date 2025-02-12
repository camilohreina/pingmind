export const TRIGGER_REGISTER_WORDS = ["hi", "hola", "buenas", "hello"];

export const AUTO_REPLY_REGISTER = (phone: string) =>
  `¡Hola! 👋 Este es un mensaje de Camilo, el creador de PingMind:\n
¡Tengo buenas noticias! Ahora puedes probar pingmind gratis por 3 días y descubrir todas sus funcionalidades 🎉
Ingresa a la web para registrarte y elegir uno de nuestros planes. Tranqui, puedes cancelar en cualquier momento 🤝
https://pingmind.vercel.app/es/signup?phone=${phone} \n
Una vez tengas un plan, vuelve a esta conversación y envía un mensaje para seguir conversando.\n
¡Gracias por ser parte de esta aventura! 🚀`;

export const getInfobipConfig = () => ({
  apiKey: process.env.INFOBIP_API_KEY || "",
  baseUrl: process.env.INFOBIP_BASE_URL || "",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "",
});

export const locales = ["en", "es"];
