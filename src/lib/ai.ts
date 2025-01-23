import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { AiError } from "./error";

export const processUserMessage = async ({
  timezone,
  message,
  phone,
}: {
  timezone: string;
  message: string;
  phone: string;
}) => {
  try {
    const { object } = await generateObject({
      output: "object",
      temperature: 0.5,
      model: openai("gpt-4o"),
      schema: z.object({
        action: z.enum(["create", "update", "delete"]),
        message: z.string(),
        title: z.string(),
        date: z.string(),
        timezone: z.string(),
        localDate: z.string(),
      }),
      system: `
            You are an assistant designed to process natural language reminder messages. Your task is to extract information from the messages and return a JSON object with the following properties:
              - 'action': The action to be performed on the reminder, which can be one of the following: 'create' (for new reminders), 'update' (to modify an existing reminder), or 'delete' (to remove a reminder).
              - 'title': A short and descriptive title summarizing the reminder, making it easy to identify in a list and suitable for editing or deletion.
              - 'message': The original text of the reminder provided by the user.
              - 'date': The date and time extracted from the reminder, formatted in ISO 8601 standard in UTC (e.g., "2025-01-08T17:00:00Z"). Be precise with the conversion to UTC, considering the user's local time and time zone.
              - 'timezone': The user's time zone is ${timezone}.
              - 'localDate': The date and time in the user's local time zone, formatted as ISO 8601.
              The current date and time is ${new Date().toISOString()}, and the user's timezone is UTC, inferred from their phone number: ${phone}.
              Ensure that:
              1. The 'date' is always provided in the correct ISO 8601 format in UTC.
              2. If no specific date or time is mentioned in the message, the 'date' should be null.
              3. Handle ambiguous time expressions intelligently, clarifying AM/PM and dates (e.g., "tomorrow" or "next Friday").
              `,
      prompt: message,
      mode: "json",
    });

    return object;
  } catch (error) {
    throw new AiError("Error processing message with AI");
  }
};
