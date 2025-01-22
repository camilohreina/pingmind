import { AUTO_REPLY_REGISTER } from "@/config/constants";
import { Infobip, AuthType } from "@infobip-api/sdk";

const client = new Infobip({
  baseUrl: process.env.INFOBIP_BASE_URL!,
  apiKey: process.env.INFOBIP_API_KEY!,
  authType: AuthType.ApiKey,
});

export const sendRegisterMessage = async () => {
  try {
    const response = await client.channels.whatsapp.send({
      type: "text",
      from: process.env.INFOBIP_PHONE_NUMBER!,
      to: "573224354004",
      content: {
        text: AUTO_REPLY_REGISTER,
      },
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};
