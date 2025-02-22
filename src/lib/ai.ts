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
          - 'action': The action to be performed on the reminder, which can be one of: 'CREATE' (for new reminders), 'UPDATE' (to modify an existing reminder), 'DELETE' (to remove a reminder), or 'NO ACTION'.
          - 'reminderId': The unique identifier of the reminder to be updated or deleted. This field is CRITICAL and REQUIRED when action is 'UPDATE' or 'DELETE'. You must identify which existing reminder the user is referring to and include its exact ID.
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

          7. Time Defaults (ALL in LOCAL time):
            - No specific time mentioned → 09:00:00 local time
            - Time periods in any language:
              * Morning → 09:00:00 local
              * Afternoon → 14:00:00 local
              * Evening → 18:00:00 local
              * Night → 20:00:00 local

          8. Local Time Interpretation (when AM/PM not specified):
            - 5:00-11:59 → AM
            - 12:00-16:59 → PM
            - 17:00-23:59 → PM
            - 00:00-4:59 → AM

          9. Date Processing:
            - Process ALL dates in local timezone first
            - Default to current local date if unspecified
            - Next local date if local time has passed
            - Convert to UTC only after local date/time is confirmed
            - Handle culture-specific date formats

          10. Validation:
              - Validate times in LOCAL timezone first
              - Confirm UTC conversion maintains correct local time
              - Verify date adjustments during UTC conversion
              - Ensure all times have seconds set to 00
              - Validate timezone offset calculations

          11. Error Cases:
              - Invalid local time formats
              - Invalid UTC conversions
              - Timezone calculation errors
              - Missing timezone information
              - Ambiguous local times
              - Daylight saving time edge cases

          12. Response Formatting:
              - ALWAYS show times to users in their local timezone
              - Include AM/PM indicators for clarity
              - Specify "hora local" in responses
              - Example responses:
                * "Recordatorio programado para hoy a las 9:00 PM hora local"
                * "Reminder set for today at 9:00 PM local time"

          13. Reminder Message Format:
              For immediate reminders (when reminderDate equals date):
              - Use present tense referring to local time
              - Examples:
                * "It's time for your meeting"
                * "Es hora de tu reunión"

              For early reminders (when reminderDate is before date):
              - Use future tense with local time reference
              - Include the remaining time in local timezone
              - Examples:
                * "In 10 minutes you have a meeting"
                * "En 10 minutos tienes una reunión"

          14. JSON Response Construction:
              Example for 9:00 PM local time in Bogota:
              {
                "date": "2025-02-22T02:00:00.000Z",         // UTC time
                "localDate": "2025-02-21T21:00:00.000-05:00", // Local time
                "response": "... a las 9:00 PM hora local"
              }

          15. Time Storage Rules:
              - Store both UTC and local time versions
              - ALL comparisons for "next possible time" must use local time
              - ALL user communication must use local time
              - Internal processing uses UTC
              - Maintain timezone information for all conversions
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

export async function getTranscriptionFromAudio(
  filePath: string
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
  base64Image: string
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
