import { handleWebhook } from "@/controllers/webhook-messages.controller";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const info = await req.json();
    const [data] = info.results as any;

    //return NextResponse.json({ status: "success" }, { status: 200 });
    const result = await handleWebhook(data);
    if (result?.error) {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
