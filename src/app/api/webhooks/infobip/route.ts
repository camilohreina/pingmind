import { handleWebhook } from "@/controllers/webhook.controller";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await handleWebhook(data);
    console.log(result);
    if (result.status === "error") {
      return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
