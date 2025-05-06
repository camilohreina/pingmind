import { NextResponse } from "next/server";
import { getUserByPhone } from "@/db/queries/users";
import { handleWebhook } from "@/controllers/webhook-messages.controller";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request): Promise<NextResponse> {
  //get message from request
  const data = await req.json();
  const { phone, message } = data;

  const user = await getUserByPhone(phone);
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        status: 401,
        message: "User not found",
      },
      { status: 401 },
    );
  }

  if (typeof message !== "string" || typeof phone !== "string") {
    return NextResponse.json(
      {
        ok: false,
        status: 400,
        message: "Invalid data",
      },
      { status: 400 },
    );
  }

  const result = await handleWebhook({
    from: phone,
    message: {
      text: message,
      type: "TEXT",
    },
    messageId: crypto.randomUUID(),
  });

  return NextResponse.json(
    {
      ok: true,
      status: 200,
      message: result.message,
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
