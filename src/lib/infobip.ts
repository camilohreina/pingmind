import { AUTO_REPLY_REGISTER } from "@/config/constants";
import { TemplateDataProps } from "@/types/whatsapp";
import { Infobip, AuthType } from "@infobip-api/sdk";

const client = new Infobip({
  baseUrl: process.env.INFOBIP_BASE_URL!,
  apiKey: process.env.INFOBIP_API_KEY!,
  authType: AuthType.ApiKey,
});

export const sendRegisterMessage = async (phone: string) => {
  try {
    const response = await client.channels.whatsapp.send({
      type: "text",
      from: process.env.INFOBIP_PHONE_NUMBER!,
      to: phone,
      content: {
        text: AUTO_REPLY_REGISTER(phone),
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
  console.log("llegando al reply");
  try {
    const response = await client.channels.whatsapp.send({
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

const sendWhatsAppTemplate = async ({
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
    //SMS
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
    const response = await client.channels.whatsapp.send({
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
    throw new Error("Error al enviar el mensaje de verificación");
  }
};

export const getAudioInfobip = async ({ audioId }: { audioId: string }) => {
  try {
    const response = await client.channels.whatsapp.media.download(
      process.env.INFOBIP_PHONE_NUMBER!,
      audioId,
    );
    return response.data;
  } catch (error) {
    console.log({ error });
  }
};
