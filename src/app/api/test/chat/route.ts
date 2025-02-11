import { NextResponse } from "next/server";

import { processUserMessage } from "@/lib/ai";
import { getTimeZoneFromCountryCode } from "@/lib/utils";
import { text } from "stream/consumers";
import { handleWebhook } from "@/controllers/webhook-messages.controller";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request): Promise<NextResponse> {
  //get message from request
  const data = await req.json();
  const { countryCode } = data;
  
  getTimeZoneFromCountryCode(countryCode);

  return NextResponse.json(
    {
      ok: true,
      status: 200,
      message: "Hello, world!",
    },
    { status: 200 },
  );
/*   const {message, phone, timezone} = data;

  const infoTest = {
    message:{
      text: message,
      type: "TEXT"
    },
    from: phone,
    messageId: '123456789',
  }
  console.log(message);
  //generate response

  const objMessage = await handleWebhook(infoTest);

  console.log(objMessage);

  //return response
  return NextResponse.json(
    {
      ok: true,
      status: 200,
      message: "Hello, world!",
    },
    {status: 200},
  ); */
}
