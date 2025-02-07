import { NextResponse } from "next/server";

import { processUserMessage } from "@/lib/ai";
import { getTimeZoneFromCountryCode } from "@/lib/utils";

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
  /*   const data = await req.json();
  const {message, phone, timezone} = data;

  console.log(message);
  //generate response

  const objMessage = await processUserMessage({timezone, message, phone});

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
