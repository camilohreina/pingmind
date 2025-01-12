import {openai} from "@ai-sdk/openai";
import {generateObject, generateText} from "ai";
import {NextResponse} from "next/server";
import {z} from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request): Promise<NextResponse> {
  //get message from request
  const data = await req.json();
  const message = data.message;

  console.log(message);
  //generate response
  //return response

  //console.log(new Date().toISOString());
  /*   const {text} = await generateText({
    model: openai("gpt-4o"),
    prompt: message,
    system: `
            Eres un asistente que extrae fechas y horas de mensajes de recordatorios. 
            Devuelve un JSON con dos propiedades: 
            - message (el texto original del recordatorio)
            - date (la fecha en formato ISO 8601 en UTC, por ejemplo "2023-11-25T17:00:00Z").
            La fecha actual es ${new Date().toISOString()}.
          `,
  });

  console.log(text);
 */
  const {object} = await generateObject({
    output: "object",
    temperature: 0.5,
    model: openai("gpt-4o"),
    schema: z.object({
      action: z.enum(["create", "update", "delete"]),
      message: z.string(),
      title: z.string(),
      date: z.string(),
    }),
    system: `
          You are an assistant designed to extract dates and times from reminder messages. Your task is to return a JSON object with the following properties:
          - 'action': The action to be performed on the reminder, which can be 'create', 'update', or 'delete'.
          - 'title': A short, descriptive title for the reminder that can be used to identify it in a list and enable editing or deletion.
          - 'message': The original text of the reminder provided by the user.
          - 'date': The date and time extracted from the reminder in ISO 8601 format in UTC (e.g., "2023-11-25T17:00:00Z").
          The current date and time is ${new Date().toISOString()}.
          `,
    prompt: message,
    mode: "json",
  });

  console.log(object);

  return NextResponse.json(
    {
      ok: true,
      status: 200,
      message: "Hello, world!",
    },
    {status: 200},
  );
}
