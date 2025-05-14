import { AUTO_REPLY_REGISTER } from "@/config/constants";
import { TemplateDataProps } from "@/types/whatsapp";
import { Infobip, AuthType } from "@infobip-api/sdk";
import { translateRegistrationMessage } from "./ai";

const client = new Infobip({
  baseUrl: process.env.INFOBIP_BASE_URL!,
  apiKey: process.env.INFOBIP_API_KEY!,
  authType: AuthType.ApiKey,
});

export const sendRegisterMessage = async (phone: string, userMessage?: string) => {
  try {
    const welcome_message = AUTO_REPLY_REGISTER(phone)
    const translated_message = userMessage 
      ? await translateRegistrationMessage(userMessage, welcome_message)
      : welcome_message;

    await client.channels.whatsapp.send({
      type: "text",
      from: process.env.INFOBIP_PHONE_NUMBER!,
      to: phone,
      content: {
        text: translated_message,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendReplyReminder = async ({
  phone,
  message,
}: {
  phone: string;
  message: string;
}) => {
  try {
    await client.channels.whatsapp.send({
      type: "text",
      from: process.env.INFOBIP_PHONE_NUMBER!,
      to: phone,
      content: {
        text: message,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const sendWhatsAppTemplate = async ({
  phone,
  template_name,
  parameters,
  withButtons = false,
}: {
  phone: string;
  template_name: string;
  sendAt?: Date;
  parameters: string[];
  withButtons?: boolean;
}): Promise<string | null> => {
  try {
    const templateData: TemplateDataProps = {
      body: {
        placeholders: parameters,
      },
    };
    if (withButtons) {
      templateData.buttons = [
        {
          type: "URL",
          parameter: parameters[0],
        },
      ];
    }
    await client.channels.whatsapp.send({
      type: "template",
      messages: [
        {
          from: process.env.INFOBIP_PHONE_NUMBER!,
          to: phone,
          content: {
            templateName: template_name,
            templateData,
            language: "en_GB",
          },
        },
      ],
    });
    return null;
  } catch (error) {
    return null;
  }
};

export const verificationCodeMessage = async ({
  phone,
  code,
}: {
  phone: string;
  code: string;
}) => {
  try {
    console.log({ phone, code });
    await sendWhatsAppTemplate({
      phone,
      template_name: "pingmind_verification_code",
      parameters: [code],
      withButtons: true,
    });
  } catch (error) {
    throw new Error("Error sending verification message");
  }
};

export const getMediaInfobip = async ({ mediaId }: { mediaId: string }) => {
  try {
    const response = await client.channels.whatsapp.media.download(
      process.env.INFOBIP_PHONE_NUMBER!,
      mediaId,
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
