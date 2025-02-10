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
  //TODO: code for handle errors for code
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
        reminderDate: z.string(),
        timezone: z.string(),
        localDate: z.string(),
        response: z.string(),
        alert: z.string(),
      }),
      system: `
          You are an advanced natural language reminder processing assistant. Your task is to extract precise information from reminder messages and return a JSON object with the following properties:

          - 'action': The action to be performed on the reminder, which can be one of: 'create' (for new reminders), 'update' (to modify an existing reminder), or 'delete' (to remove a reminder).
          - 'reminderId': The unique identifier of the reminder to be updated or deleted. If the action is 'create', this field should be null.
          - 'title': A concise, descriptive title summarizing the reminder for easy identification.
          - 'message': The original text of the reminder provided by the user.
          - 'date': The date and time extracted from the reminder, formatted in ISO 8601 standard in UTC.
          - 'reminderDate': Time to send reminder in ISO 8601 UTC (calculated as X minutes before 'date')
          - 'timezone': The user's time zone is ${timezone}.
          - 'localDate': The date and time in the user's local time zone ${timezone}.
          - 'response': A confirmation message for the action taken on the reminder.
          - 'alert': A reminder message to be sent at the specified date and time.
          - 'timeConfirmed': A boolean indicating whether the time has been explicitly confirmed by the user.
          - the current date and time is ${new Date().toISOString()} in UTC.
          Time Interpretation Rules:
          1. If no AM/PM is specified, use context-based time interpretation:
            - 5:00 AM to 11:59 AM: Default to AM
            - 12:00 PM to 4:59 PM: Default to PM
            - 5:00 PM to 11:59 PM: Default to PM
            - 12:00 AM to 4:59 AM: Default to AM

          2. Time Inference Logic:
            - If the mentioned time is earlier than the current time, assume it's for the next day
            - Consider message context for time interpretation
            - Prioritize the most contextually appropriate time interpretation

          3. Date and Time Handling:
            - If no specific date is mentioned, default to today
            - If no time is specified, default to 9:00 AM in the user's local timezone
            - Precisely convert to UTC, considering the user's local time and timezone

          4. Advanced Validation:
            - Reject past dates and times
            - Handle ambiguous time expressions intelligently
            - Recognize colloquial time expressions (e.g., "this evening", "in the afternoon")

          5. Error Handling:
            - Return clear error messages for:
              * Invalid date/time formats
              * Conflicting reminders
              * Attempts to update/delete non-existent reminders
              * Messages that are too short, unclear, or excessively long  

          6. Additional Features:
            - If time is ambiguous, include a confirmation request in the response
            - Provide response in the user's language
            - Support multiple time formats and expressions
          
          7. Reminder Timing:
            - Extract number of minutes for early reminder from message
            - Calculate 'reminderDate' by subtracting minutes from event date
            - Ensure reminderDate is not in the past
            - Include both event and reminder times in response
            
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

export const getTranscriptionFromImage = async (base64: string) => {
  const response = await openaiLib.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "This image contains event information. Please extract the event details and format them as follows:\n\n" +
              "TITLE: [event title]\n" +
              "DATE: [event date]\n" +
              "TIME: [event time]\n" +
              "LOCATION: [event location]\n" +
              "DETAILS: [any important additional details]\n\n" +
              "If any field is not present in the image, omit it. Keep the format concise and direct. " +
              "Format the response exactly with these field names in capital letters followed by colons. " +
              "If you see any contact information or registration details, include them in the DETAILS section.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 500,
  });
  return response.choices[0].message.content;
};
