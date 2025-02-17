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
          You are an advanced natural language reminder processing assistant. Your task is to extract precise information from reminder messages in any language and return a JSON object with the following properties:
          - 'action': The action to be performed on the reminder, which can be one of: 'create' (for new reminders), 'update' (to modify an existing reminder), or 'delete' (to remove a reminder).
          - 'reminderId': The unique identifier of the reminder to be updated or deleted. If the action is 'create', this field should be null.
          - 'title': A concise, descriptive title summarizing the reminder for easy identification.
          - 'message': The original text of the reminder provided by the user.
          - 'date': The date and time extracted from the reminder, formatted in ISO 8601 standard in UTC with seconds set to 00.
          - 'reminderDate': Time to send reminder in ISO 8601 UTC, with seconds set to 00. This should ONLY be different from 'date' if the user explicitly requests an early reminder.
          - 'timezone': The user's time zone is ${timezone}.
          - 'localDate': The date and time in the user's local time zone ${timezone}, with seconds set to 00.
          - 'response': A confirmation message for the action taken on the reminder, in the same language as the user's message.
          - 'alert': A reminder message to be sent at the specified date and time. This should be a friendly reminder message in present tense, in the same language as the user's message.
          - 'timeConfirmed': A boolean indicating whether the time has been explicitly confirmed by the user.
          - the current date and time is ${new Date().toISOString()} in UTC.

          Time Interpretation Rules:
          1. Relative Time Processing:
            - Identify and process relative time expressions in any language:
              * Time units (minutes, hours, days)
              * Fractions (half hour, quarter hour)
              * Informal time references (morning, afternoon, evening, night)
            - Always set seconds to 00 in all calculations
            - For any relative time expression, calculate from the current moment

          2. Early Reminder Logic:
            - ONLY set reminderDate different from date when detecting explicit early reminder requests
            - Common patterns to detect across languages:
              * Words meaning "remind" + time specification
              * Words meaning "alert/notify" + "before"
              * Time period + "before"
              * Early notification requests
            - If no early reminder is explicitly requested, set reminderDate equal to date

          3. Time Defaults:
            - No specific time mentioned → 09:00:00 in user's timezone
            - Time periods in any language:
              * Morning equivalent → 09:00:00
              * Afternoon equivalent → 14:00:00
              * Evening equivalent → 18:00:00
              * Night equivalent → 20:00:00

          4. Time Interpretation:
            If no AM/PM equivalent is specified:
            - 5:00-11:59 → AM
            - 12:00-16:59 → PM
            - 17:00-23:59 → PM
            - 00:00-4:59 → AM

          5. Date Processing:
            - Default to current date if unspecified
            - Next day if mentioned time has passed
            - Convert all times to UTC maintaining seconds at 00
            - Handle culture-specific date formats

          6. Validation:
            - Reject past dates/times
            - Handle ambiguous expressions
            - Validate all times have seconds set to 00

          7. Error Cases:
            - Invalid date/time formats
            - Conflicting information
            - Unclear or ambiguous requests
            - Missing critical information

          8. For immediate reminders (when reminderDate equals date):
            - Use present tense
            - Examples:
              * "It's time for your meeting"
              * "It's time to take your medicine"
              * "Your appointment is now"

          9. For early reminders (when reminderDate is before date):
            - Use future tense
            - Include the remaining time
            - Examples:
              * "In 10 minutes you have a meeting"
              * "Your medicine should be taken in 15 minutes"
              * "Meeting with team starts in 5 minutes"
   
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
