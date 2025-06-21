import { openai } from "@ai-sdk/openai";
import { OpenAI } from "openai";
import { generateObject, generateText, tool } from "ai";
import { z } from "zod";
import { AiError } from "./error";
import fs from "fs";

import {
  addNewReminder,
  cancelReminder,
  getRemindersUserByPhone,
  updatePendingReminder,
} from "@/controllers/reminder.controller";
import { SYSTEM_PROMPT_MCP } from "@/config/constants";
import {
  createLogMessage,
  finishContextMessage,
} from "@/db/queries/log-messages";
import { dateFromHumanWithTimezone } from "./utils";
const openaiLib = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Reminder {
  id: string;
  title: string;
  message: string;
  date: string | null;
}

export async function getTranscriptionFromAudio(
  filePath: string,
): Promise<string> {
  try {
    const response = await openaiLib.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });
    return response.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "";
  }
}

export async function getTranscriptionFromImage(
  base64Image: string,
): Promise<string> {
  try {
    const response = await openaiLib.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an assistant that helps extract event details from images. 
          Return ONLY the extracted information in the following format:
          "<event title>: <event description> | <date-time>".

          If there is no event information, return an empty string.

          Rules:
          - Return ONLY the extracted text, no additional notes or explanations
          - Format date-times in a readable, natural language format
          - If no clear event is in the image, return an empty string`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: "Extract any event, reminder or appointment information from this image.",
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error processing image:", error);
    return "";
  }
}

export async function translateRegistrationMessage(
  user_message: string,
  welcome_message: string,
): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are a language detection and translation assistant. First, detect the language of the user's message. If the detected language is Spanish, replace any link in the registration message that matches the pattern "https://pingmind.app/en/signup?phone={phone}" with "https://pingmind.app/es/signup?phone={phone}", preserving the dynamic phone value. For any other language, keep the original link unchanged. Then, translate the registration message to the detected language, maintaining a friendly and welcoming tone. Only return the translated message, no additional notes or explanations.`,
        },
        {
          role: "user",
          content: `User's message: "${user_message}". Detect language and translate the following registration message to the same language as the user's message: "${welcome_message}". Remember to update the signup link as described if the language is Spanish.`,
        },
      ],
    });
    return text;
  } catch (error) {
    console.error("Error translating registration message:", error);
    // Fallback to English if translation fails
    return welcome_message;
  }
}

const getRemindersByUser = tool({
  description: "get reminders list by user",
  parameters: z.object({
    phone: z.string().describe("User phone number"),
    timezone: z.string().describe("User's timezone by phone"),
  }),
  execute: async ({ phone, timezone }) => {
    const reminders = await getRemindersUserByPhone({ phone, timezone });
    if (reminders.length === 0) {
      return { success: true, error: "No reminders found" };
    }
    return {
      success: true,
      reminders,
    };
  },
});

const createReminderUser = tool({
  description: "create reminder user",
  parameters: z.object({
    phone: z.string(),
    title: z.string().describe("Title of the reminder"),
    language: z.string().describe("MUST detect language from user's message: 'es' for Spanish messages, 'en' for English messages. Analyze the user's actual message language, not a default."),
    message: z.string().describe("Description of the reminder"),
    response: z
      .string()
      .describe("Response to the user, must be in present tense"),
    alert: z
      .string()
      .describe(
        "Alert message to be sent, must be in present tense because it will be sent at the time of the reminder",
      ),
    timezone: z.string().describe("User's timezone by phone"),
    dueDate: z
      .string()
      .describe(
        "This property is mandatory in ENGLISH. Natural language due date for when to SEND the reminder notification like 'tomorrow', 'tomorrow at 3pm', 'today at 9am', 'next Monday', 'Jan 23' (optional). ONLY in English.",
      ),
    eventDate: z
      .string()
      .optional()
      .describe(
        "Optional. Natural language date for the ACTUAL EVENT in ENGLISH. Only provide this if different from dueDate (e.g., when user requests early reminder). If user says 'meeting at 9:30am, remind me 15 minutes before', then dueDate='today at 9:15am' and eventDate='today at 9:30am'",
      ),
  }),
  execute: async ({
    phone,
    dueDate,
    eventDate,
    message,
    language,
    title,
    response,
    alert,
    timezone,
  }) => {
if (process.env.DEBUG === "true") {
  console.log({
      phone,
      language,
      dueDate,
      eventDate,
      message,
      title,
      response,
      alert,
      timezone,
  });
}

    // Parse the reminder notification time (when to send the reminder)
    const reminderDate = dateFromHumanWithTimezone(dueDate, timezone);
    if (!reminderDate) {
      throw new AiError("Error parsing reminder date");
    }

    // Parse the actual event time (when the event happens)
    let actualEventDate = reminderDate; // Default to same as reminder date
    if (eventDate) {
      const parsedEventDate = dateFromHumanWithTimezone(eventDate, timezone);
      if (parsedEventDate) {
        actualEventDate = parsedEventDate;
      }
    }

    const reminder_user = {
      message,
      response,
      reminderDate: reminderDate.toISOString(), // When to send notification
      localDate: actualEventDate.toISOString(), // When event actually happens
      alert,
      title,
    };
    const newReminder = addNewReminder({
      phone,
      reminder_user,
    });
    if (!newReminder) {
      return { success: false, error: "Error creating reminder" };
    }
    return {
      success: true,
      reminder: newReminder,
    };
  },
});

const getReminderId = tool({
  description: "get reminder id to update",
  parameters: z.object({
    phone: z.string().describe("User phone number"),
    description: z.string().describe("Description of the reminder"),
    timezone: z.string().describe("User's timezone by phone"),
  }),
  execute: async ({ phone, description, timezone }) => {
    const reminders = await getRemindersUserByPhone({ phone, timezone });
    if (reminders.length === 0) {
      return { success: true, error: "No reminders found" };
    }

    const { object } = await generateObject({
      output: "object",
      temperature: 0.5,
      model: openai("gpt-4o-mini"),
      schema: z.object({
      reminderId: z.string(),
      }),
      system: `You are an assistant specialized in interpreting changes to reminders.
      The user will provide you with an instruction to modify an existing reminder.
      You must identify which reminder the user wants to modify.
      Respond in JSON format with the following fields:
      - reminderId: ID of the reminder to modify`,

      prompt: `Current reminders: ${JSON.stringify(reminders)}
        User message: ${description}`,
      mode: "json",
    });

    return {
      success: true,
      reminderId: object.reminderId,
    };
  },
});

const updateReminderUser = tool({
  description: "update reminder user",
  parameters: z.object({
    reminderId: z.string().describe("ID of the reminder to update"),
    title: z.string().describe("Title of the reminder"),
    message: z.string().describe("Description of the reminder"),
    response: z
      .string()
      .describe("Response to the user, must be in present tense"),
    alert: z
      .string()
      .describe(
        "Alert message to be sent, must be in present tense because it will be sent at the time of the reminder",
      ),
    timezone: z.string().describe("User's timezone by phone"),
    dueDate: z
      .string()
      .describe(
        "This property is mandatory in ENGLISH. Natural language due date for when to SEND the reminder notification like 'tomorrow', 'tomorrow at 3pm', 'today at 9am', 'next Monday', 'Jan 23' (optional). ONLY in English.",
      ),
    eventDate: z
      .string()
      .optional()
      .describe(
        "Optional. Natural language date for the ACTUAL EVENT in ENGLISH. Only provide this if different from dueDate (e.g., when user requests early reminder).",
      ),
  }),
  execute: async ({
    reminderId,
    dueDate,
    eventDate,
    message,
    title,
    response,
    alert,
    timezone,
  }) => {
    // Parse the reminder notification time (when to send the reminder)
    const reminderDate = dateFromHumanWithTimezone(dueDate, timezone);
    if (!reminderDate) {
      throw new AiError("Error parsing reminder date");
    }

    // Parse the actual event time (when the event happens)
    let actualEventDate = reminderDate; // Default to same as reminder date
    if (eventDate) {
      const parsedEventDate = dateFromHumanWithTimezone(eventDate, timezone);
      if (parsedEventDate) {
        actualEventDate = parsedEventDate;
      }
    }

    const reminder_user = {
      message,
      response,
      reminderDate: reminderDate.toISOString(), // When to send notification
      localDate: actualEventDate.toISOString(), // When event actually happens
      alert,
      title,
    };
    const updatedReminder = updatePendingReminder({
      reminderId,
      reminder_user,
    });
    if (!updatedReminder) {
      return { success: false, error: "Error updating reminder" };
    }
    return {
      success: true,
      reminder: updatedReminder,
    };
  },
});

const deleteReminderUser = tool({
  description: "delete reminder user",
  parameters: z.object({
    reminderId: z.string().describe("ID of the reminder to delete"),
  }),
  execute: async ({ reminderId }) => {
    await cancelReminder({ reminderId });
    return {
      success: true,
      reminderId,
    };
  },
});
async function getTools() {
  return {
    getRemindersByUser,
    createReminderUser,
    getReminderId,
    updateReminderUser,
    deleteReminderUser,
  };
}

interface UserMessageI {
  role: "data" | "user" | "system" | "assistant";
  content: string;
}

interface ContextMessagesI {
  id: string;
  content: string;
  is_reply: boolean;
}

export async function processMessageByUser({
  userId,
  message,
  phone,
  context_messages,
  timezone,
}: {
  userId: string;
  message: string;
  phone: string;
  context_messages?: ContextMessagesI[];
  timezone: string;
}) {
  try {
    let context: UserMessageI[] = [];
    if (context_messages && context_messages.length > 0) {
      context = context_messages.map((item) => {
        return {
          role: item.is_reply ? "assistant" : "user",
          content: item.content,
        };
      });
    }
    const userMessage: UserMessageI = { role: "user", content: message };
    const tools = await getTools();
    const SYSTEM_PROMPT = SYSTEM_PROMPT_MCP(phone, timezone);
    console.log({context});
    const { text, steps } = await generateText({
      model: openai("gpt-4o-mini"),
      tools,
      messages: [...context, userMessage],
      system: SYSTEM_PROMPT,
      maxSteps: 5,
    });
    const allToolCalls = steps.flatMap((step) => step.toolCalls);
    const hasUsedReminderTool = allToolCalls.some((toolCall) =>
      [
        "createReminderUser",
        "updateReminderUser",
        "deleteReminderUser",
      ].includes(toolCall.toolName),
    );

    if (
      hasUsedReminderTool &&
      context_messages &&
      context_messages.length > 0
    ) {
      const messagesId = context_messages?.map((item) => item.id);
      await finishContextMessage(messagesId);
    }
    await createLogMessage({
      id: crypto.randomUUID(),
      message_id: crypto.randomUUID(),
      user_id: userId,
      content: text,
      is_reply: true,
      used_context: hasUsedReminderTool,
    });
    return { text, hasUsedReminderTool };
  } catch (error) {
    console.log(error);
    throw new AiError("Error processing message with AI");
  }
}
