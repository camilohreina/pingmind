import { openai } from "@ai-sdk/openai";
import { OpenAI } from "openai";
import { generateObject } from "ai";
import { z } from "zod";
import { AiError } from "./error";
import fs from "fs";

const openaiLib = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Reminder {
  id: string;
  title: string;
  message: string;
  date: string | null;
}

export const processUserMessage = async ({
  timezone,
  message,
  phone,
  reminders,
}: {
  timezone: string;
  message: string;
  phone: string;
  reminders: Reminder[];
}) => {
  try {
    const { object } = await generateObject({
      output: "object",
      temperature: 0.5,
      model: openai("gpt-4o"),
      schema: z.object({
        action: z.enum(["CREATE", "UPDATE", "DELETE", "NO ACTION"]),
        reminderId: z.string().optional().nullable(),
        message: z.string(),
        title: z.string(),
        date: z.string(),
        timezone: z.string(),
        localDate: z.string(),
        response: z.string(),
        alert: z.string(),
      }),
      system: `
            You are an assistant designed to process natural language reminder messages. Your task is to extract information from the messages and return a JSON object with the following properties:
              - 'action': The action to be performed on the reminder, which can be one of the following: 'create' (for new reminders), 'update' (to modify an existing reminder), or 'delete' (to remove a reminder).
              - 'reminderId': The unique identifier of the reminder to be updated or deleted. If the action is 'create', this field should be null.
              - 'title': A short and descriptive title summarizing the reminder, making it easy to identify in a list and suitable for editing or deletion.
              - 'message': The original text of the reminder provided by the user.
              - 'date': The date and time extracted from the reminder, formatted in ISO 8601 standard in UTC (e.g., "2025-01-08T17:00:00Z"). Be precise with the conversion to UTC, considering the user's local time and time zone.
              - 'timezone': The user's time zone is ${timezone}.
              - 'localDate': The date and time in the user's local time zone, formatted as ISO 8601.
              - 'response': A message to be sent back to the user, confirming the action taken on the reminder.
              - 'alert': A message to be sent to the user as a reminder at the specified date and time.
              The current date and time is ${new Date().toISOString()}, and the user's timezone is UTC, inferred from their phone number: ${phone}.
              Ensure that:
              1. The 'date' is always provided in the correct ISO 8601 format in UTC.
              2. If no specific date or time is mentioned in the message, the 'date' should be null.
              3. Handle ambiguous time expressions intelligently, clarifying AM/PM and dates (e.g., "tomorrow" or "next Friday").
              `,
      prompt: `Current reminders: ${JSON.stringify(reminders)}
          User message: ${message}`,
      mode: "json",
    });

    return object;
  } catch (error) {
    console.log(error);
    throw new AiError("Error processing message with AI");
  }
};

export const getTranscriptionFromAudio = async (audioPath: string) => {
  const transcription = await openaiLib.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
  });
  return transcription;
};
