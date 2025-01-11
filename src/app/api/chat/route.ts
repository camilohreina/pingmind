import {openai} from "@ai-sdk/openai";
import {generateText, streamText} from "ai";
import {NextResponse} from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request): Promise<NextResponse> {
  console.log("Llegandooo");

  return NextResponse.json(
    {
      ok: true,
      status: 200,
      message: "Hello, world!",
    },
    {status: 200},
  );

  const {messages} = await req.json();

  const {text} = await generateText({
    model: openai("gpt-4o"),
    messages,
  });
}
